import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Skeleton,
  CardActionArea,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { api } from "../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  const number = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        boxShadow: 3,
        background: `linear-gradient(135deg, ${
          color === "primary"
            ? "#1976d2"
            : color === "success"
            ? "#2e7d32"
            : color === "info"
            ? "#0288d1"
            : "#ed6c02"
        } 0%, rgba(255,255,255,0.9) 100%)`,
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
          boxShadow: onClick ? 6 : 3,
        },
      }}
    >
      <CardActionArea onClick={onClick} disabled={!onClick}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.2, sm: 2 }}>
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                color: `${color}.main`,
                display: "grid",
                placeItems: "center",
                boxShadow: 2,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(0,0,0,0.7)",
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {title}
              </Typography>

              <Typography
                fontWeight={700}
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.3rem", sm: "1.6rem" },
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState({
    licitacoes: 0,
    contratos: 0,
    usuarios: 0,
    notificacoes: 0,
  });
  const [ultimas, setUltimas] = React.useState([]);
  const [ultimosContratos, setUltimosContratos] = React.useState([]);
  const [serie, setSerie] = React.useState([]);
  const [serieContratos, setSerieContratos] = React.useState([]);
  const [estatisticas, setEstatisticas] = React.useState({
    valorTotalContratos: 0,
    contratosAtivos: 0,
    licitacoesAbertas: 0,
    vencendoEm30Dias: 0,
  });

  React.useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        const [lics, cons, users, notifs] = await Promise.all([
        api.get("/licitacoes/"),
        api.get("/contratos/").catch(() => ({ data: [] })),
        api.get("/usuarios").catch((error) => {
          console.error("Erro ao buscar usuários no dashboard:", error?.response?.data || error);
          return { data: [] };
        }),
        api.get("/notificacoes/?apenas_nao_lidas=true").catch(() => ({ data: [] })),
      ]);

        const licitacoes = Array.isArray(lics.data) ? lics.data : [];
        const contratos = Array.isArray(cons.data) ? cons.data : [];
        const usuarios = Array.isArray(users.data) ? users.data : [];
        const notificacoes = Array.isArray(notifs.data) ? notifs.data : [];

        setKpis({
          licitacoes: licitacoes.length,
          contratos: contratos.length,
          usuarios: usuarios.length,
          notificacoes: notificacoes.length,
        });

        const ult = [...licitacoes]
          .sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura))
          .slice(0, 5);
        setUltimas(ult);

        const ultContratos = [...contratos]
          .sort(
            (a, b) =>
              new Date(b.data_assinatura || b.data_inicio) -
              new Date(a.data_assinatura || a.data_inicio)
          )
          .slice(0, 5);
        setUltimosContratos(ultContratos);

        const valorTotal = contratos.reduce(
          (acc, c) => acc + (parseFloat(c.valor_total) || 0),
          0
        );

        const contratosAtivos = contratos.filter((c) =>
          c.status?.toLowerCase().includes("ativo")
        ).length;

        const licitacoesAbertas = licitacoes.filter(
          (l) =>
            l.status?.toLowerCase().includes("aberto") ||
            l.status?.toLowerCase().includes("andamento")
        ).length;

        const hoje = dayjs();
        const vencendoEm30 = contratos.filter((c) => {
          if (!c.data_fim) return false;
          const dataFim = dayjs(c.data_fim);
          return dataFim.isAfter(hoje) && dataFim.diff(hoje, "days") <= 30;
        }).length;

        setEstatisticas({
          valorTotalContratos: valorTotal,
          contratosAtivos,
          licitacoesAbertas,
          vencendoEm30Dias: vencendoEm30,
        });

        const year = dayjs().year();

        const counts = Array.from({ length: 12 }, (_, m) => ({
          mes: dayjs().month(m).format("MMM"),
          total: 0,
        }));

        licitacoes.forEach((l) => {
          const d = dayjs(l.data_abertura);
          if (d.isValid() && d.year() === year) {
            counts[d.month()].total += 1;
          }
        });
        setSerie(counts);

        const contractCounts = Array.from({ length: 12 }, (_, m) => ({
          mes: dayjs().month(m).format("MMM"),
          total: 0,
        }));

        contratos.forEach((c) => {
          const d = dayjs(c.data_assinatura || c.data_inicio);
          if (d.isValid() && d.year() === year) {
            contractCounts[d.month()].total += 1;
          }
        });
        setSerieContratos(contractCounts);
      } catch (e) {
        setKpis({ licitacoes: 0, contratos: 0, usuarios: 0, notificacoes: 0 });
        setUltimas([]);
        setUltimosContratos([]);
        setEstatisticas({
          valorTotalContratos: 0,
          contratosAtivos: 0,
          licitacoesAbertas: 0,
          vencendoEm30Dias: 0,
        });

        setSerie(
          Array.from({ length: 12 }, (_, m) => ({
            mes: dayjs().month(m).format("MMM"),
            total: 0,
          }))
        );

        setSerieContratos(
          Array.from({ length: 12 }, (_, m) => ({
            mes: dayjs().month(m).format("MMM"),
            total: 0,
          }))
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  const totalSerie = serie.reduce((acc, item) => acc + item.total, 0);
  const totalSerieContratos = serieContratos.reduce((acc, item) => acc + item.total, 0);
  const maiorSerie = serie.length ? Math.max(...serie.map((s) => s.total)) : 0;
  const maiorSerieContratos = serieContratos.length
    ? Math.max(...serieContratos.map((s) => s.total))
    : 0;
  const mediaSerie = (totalSerie / 12).toFixed(1);
  const mediaSerieContratos = (totalSerieContratos / 12).toFixed(1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 4 },
          flex: 1,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={1}
          sx={{
            fontSize: { xs: "1.7rem", sm: "2rem", md: "2.125rem" },
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            backgroundClip: "text",
            color: "transparent",
            display: "inline-block",
          }}
        >
          Dashboard
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          mb={{ xs: 3, md: 4 }}
          sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" } }}
        >
          Visão geral do sistema de monitoramento de licitações e contratos.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                title="Licitações"
                value={kpis.licitacoes}
                color="primary"
                icon={<AssessmentIcon color="primary" />}
                onClick={() => navigate("/licitacoes")}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                title="Contratos"
                value={kpis.contratos}
                color="success"
                icon={<AssignmentIcon color="success" />}
                onClick={() => navigate("/contratos")}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                title="Usuários"
                value={kpis.usuarios}
                color="info"
                icon={<PeopleAltIcon color="info" />}
                onClick={() => navigate("/usuarios")}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                title="Notificações"
                value={kpis.notificacoes}
                color="warning"
                icon={<NotificationsActiveIcon color="warning" />}
                onClick={() => navigate("/notificacoes")}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                height: { xs: "auto", md: 400 },
                overflow: "hidden",
                boxShadow: 3,
                background: "linear-gradient(135deg, #fff 0%, #f8faff 100%)",
              }}
            >
              <CardContent sx={{ height: "100%", p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" } }}
                  >
                    📊 Licitações por mês ({dayjs().year()})
                  </Typography>
                  <Chip
                    label={`Total: ${totalSerie}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {loading ? (
                  <Skeleton variant="rounded" height={280} />
                ) : (
                  <Box
                    sx={{ height: { xs: 220, sm: 260, md: 300 } }}
                    translate="no"
                    className="notranslate"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={serie}
                        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                            <stop offset="50%" stopColor="#42a5f5" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#90caf9" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1976d2" />
                            <stop offset="50%" stopColor="#42a5f5" />
                            <stop offset="100%" stopColor="#64b5f6" />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0e0e0"
                          strokeOpacity={0.5}
                        />

                        <XAxis
                          dataKey="mes"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, "dataMax + 1"]}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            fontSize: "14px",
                          }}
                          labelStyle={{ color: "#333", fontWeight: "bold" }}
                          formatter={(value) => [
                            `${value} licitação${value !== 1 ? "ões" : ""}`,
                            "Total",
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                          cursor={{
                            stroke: "#1976d2",
                            strokeWidth: 2,
                            strokeDasharray: "5 5",
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="url(#strokeGradient)"
                          strokeWidth={3}
                          fill="url(#colorTotal)"
                          isAnimationActive={false}
                          dot={{
                            fill: "#1976d2",
                            stroke: "#fff",
                            strokeWidth: 2,
                            r: 5,
                          }}
                          activeDot={{
                            r: 8,
                            fill: "#1976d2",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <Chip
                    label={`Maior: ${maiorSerie}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Média: ${mediaSerie}`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                height: { xs: "auto", md: 400 },
                overflow: "hidden",
                boxShadow: 3,
                background: "linear-gradient(135deg, #fff 0%, #f0fff4 100%)",
              }}
            >
              <CardContent sx={{ height: "100%", p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    color="success.main"
                    sx={{ fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" } }}
                  >
                    📋 Contratos por mês ({dayjs().year()})
                  </Typography>
                  <Chip
                    label={`Total: ${totalSerieContratos}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {loading ? (
                  <Skeleton variant="rounded" height={280} />
                ) : (
                  <Box
                    sx={{ height: { xs: 220, sm: 260, md: 300 } }}
                    translate="no"
                    className="notranslate"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={serieContratos}
                        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorTotalContratos"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8} />
                            <stop offset="50%" stopColor="#66bb6a" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#a5d6a7" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient
                            id="strokeGradientContratos"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#2e7d32" />
                            <stop offset="50%" stopColor="#4caf50" />
                            <stop offset="100%" stopColor="#66bb6a" />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0e0e0"
                          strokeOpacity={0.5}
                        />

                        <XAxis
                          dataKey="mes"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, "dataMax + 1"]}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            fontSize: "14px",
                          }}
                          labelStyle={{ color: "#333", fontWeight: "bold" }}
                          formatter={(value) => [
                            `${value} contrato${value !== 1 ? "s" : ""}`,
                            "Total",
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                          cursor={{
                            stroke: "#2e7d32",
                            strokeWidth: 2,
                            strokeDasharray: "5 5",
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="url(#strokeGradientContratos)"
                          strokeWidth={3}
                          fill="url(#colorTotalContratos)"
                          isAnimationActive={false}
                          dot={{
                            fill: "#2e7d32",
                            stroke: "#fff",
                            strokeWidth: 2,
                            r: 5,
                          }}
                          activeDot={{
                            r: 8,
                            fill: "#2e7d32",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <Chip
                    label={`Maior: ${maiorSerieContratos}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Média: ${mediaSerieContratos}`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  background: "linear-gradient(135deg, #e3f2fd 0%, #fff 100%)",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    fontWeight="bold"
                    color="primary.main"
                    mb={2}
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    📈 Insights do Mês
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box
                      sx={{
                        p: { xs: 2, sm: 3 },
                        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                        color: "white",
                        borderRadius: 3,
                        textAlign: "center",
                        boxShadow: 2,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                      >
                        {serie[dayjs().month()]?.total || 0}
                      </Typography>
                      <Typography variant="body2">
                        Licitações este mês ({dayjs().format("MMM")})
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: { xs: 2, sm: 3 },
                        background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                        color: "white",
                        borderRadius: 3,
                        textAlign: "center",
                        boxShadow: 2,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                      >
                        {maiorSerie}
                      </Typography>
                      <Typography variant="body2">Pico do ano</Typography>
                    </Box>

                    <Box
                      sx={{
                        p: { xs: 2, sm: 3 },
                        background: "linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)",
                        color: "white",
                        borderRadius: 3,
                        textAlign: "center",
                        boxShadow: 2,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                      >
                        {mediaSerie}
                      </Typography>
                      <Typography variant="body2">Média mensal</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    fontWeight="bold"
                    mb={2}
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    🎯 Progresso Anual
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {["1º Trim", "2º Trim", "3º Trim", "4º Trim"].map((trimestre, index) => {
                      const startMonth = index * 3;
                      const trimTotal = serie
                        .slice(startMonth, startMonth + 3)
                        .reduce((acc, item) => acc + item.total, 0);
                      const maxTrim = 15;
                      const percentage = (trimTotal / maxTrim) * 100;

                      return (
                        <Box key={trimestre}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">{trimestre}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {trimTotal}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              height: 10,
                              bgcolor: "grey.200",
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${Math.min(percentage, 100)}%`,
                                background:
                                  index === 0
                                    ? "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)"
                                    : index === 1
                                    ? "linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)"
                                    : index === 2
                                    ? "linear-gradient(90deg, #f57c00 0%, #ffb74d 100%)"
                                    : "linear-gradient(90deg, #d32f2f 0%, #f28b82 100%)",
                                transition: "width 1s ease-out",
                                borderRadius: 2,
                                boxShadow: 1,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #fff3e0 0%, #fff 100%)",
                border: "1px solid #ff9800",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <NotificationsActiveIcon
                    sx={{ color: "warning.main", mr: 1, fontSize: 28 }}
                  />
                  <Typography
                    fontWeight="bold"
                    color="warning.main"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    ⚠️ Alertas Importantes
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor:
                        estatisticas.vencendoEm30Dias > 0 ? "error.light" : "success.light",
                      color: "white",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                    >
                      {estatisticas.vencendoEm30Dias}
                    </Typography>
                    <Typography variant="body2">
                      Contratos vencendo em 30 dias
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor:
                        estatisticas.licitacoesAbertas > 5 ? "warning.light" : "info.light",
                      color: "white",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                    >
                      {estatisticas.licitacoesAbertas}
                    </Typography>
                    <Typography variant="body2">Licitações em andamento</Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "primary.light",
                      color: "white",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.125rem" } }}
                    >
                      {estatisticas.contratosAtivos}
                    </Typography>
                    <Typography variant="body2">Contratos ativos</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #e8f5e8 0%, #fff 100%)",
                border: "1px solid #4caf50",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AssignmentIcon sx={{ color: "success.main", mr: 1, fontSize: 28 }} />
                  <Typography
                    fontWeight="bold"
                    color="success.main"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    💰 Resumo Financeiro
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                    color: "white",
                    borderRadius: 3,
                    textAlign: "center",
                    boxShadow: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.4rem", sm: "2rem", md: "2.125rem" } }}
                  >
                    {formatCurrency(estatisticas.valorTotalContratos)}
                  </Typography>
                  <Typography variant="body2">Valor total em contratos</Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Chip
                    label={`${kpis.contratos} Contratos`}
                    color="success"
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                  <Chip
                    label={`${estatisticas.contratosAtivos} Ativos`}
                    color="primary"
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                </Stack>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Valor médio por contrato
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {formatCurrency(
                      kpis.contratos > 0
                        ? estatisticas.valorTotalContratos / kpis.contratos
                        : 0
                    )}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    🔄 Últimas Licitações
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/licitacoes")}
                    startIcon={<AssessmentIcon />}
                  >
                    Ver Todas
                  </Button>
                </Box>

                {loading ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                  </Stack>
                ) : ultimas.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <AssessmentIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Nenhuma licitação encontrada
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => navigate("/licitacoes")}
                      startIcon={<AddIcon />}
                    >
                      Cadastrar Primeira Licitação
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {ultimas.map((lic, index) => (
                      <Box
                        key={lic.id_licitacao || index}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
                          boxShadow: 1,
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() =>
                          navigate(`/licitacoes?id=${lic.id_licitacao || index + 1}`)
                        }
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              {lic.numero_processo || `Licitação ${index + 1}`}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {lic.objeto || "Objeto não informado"}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                mt: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={lic.modalidade || "N/A"}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={lic.status || "Em andamento"}
                                size="small"
                                color={
                                  lic.status?.toLowerCase().includes("conclu")
                                    ? "success"
                                    : lic.status?.toLowerCase().includes("homolog")
                                    ? "success"
                                    : lic.status?.toLowerCase().includes("cancel")
                                    ? "error"
                                    : "warning"
                                }
                              />
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              textAlign: { xs: "left", sm: "right" },
                              ml: { xs: 0, sm: 1 },
                              width: { xs: "100%", sm: "auto" },
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(lic.data_abertura).format("DD/MM/YYYY")}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="primary.main"
                              fontWeight={600}
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {lic.orgao_responsavel || "Órgão não informado"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f0f8f0 100%)",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                  >
                    📋 Últimos Contratos
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/contratos")}
                    startIcon={<AssignmentIcon />}
                    color="success"
                  >
                    Ver Todos
                  </Button>
                </Box>

                {loading ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                  </Stack>
                ) : ultimosContratos.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Nenhum contrato encontrado
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mt: 2 }}
                      onClick={() => navigate("/contratos")}
                      startIcon={<AddIcon />}
                    >
                      Cadastrar Primeiro Contrato
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {ultimosContratos.map((contrato, index) => (
                      <Box
                        key={contrato.id || index}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          background: "linear-gradient(135deg, #ffffff 0%, #f9fff9 100%)",
                          boxShadow: 1,
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: "success.main",
                            boxShadow: "0 4px 12px rgba(76,175,80,0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => navigate(`/contratos?id=${contrato.id || index + 1}`)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              {contrato.numero_contrato || `Contrato ${index + 1}`}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {contrato.objeto || "Objeto não informado"}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                mt: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={contrato.fornecedor || "Fornecedor N/A"}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                label={contrato.status || "Ativo"}
                                size="small"
                                color={
                                  contrato.status?.toLowerCase().includes("ativo")
                                    ? "success"
                                    : contrato.status?.toLowerCase().includes("encerrado")
                                    ? "error"
                                    : "warning"
                                }
                              />
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              textAlign: { xs: "left", sm: "right" },
                              ml: { xs: 0, sm: 1 },
                              width: { xs: "100%", sm: "auto" },
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(contrato.data_assinatura || contrato.data_inicio).format(
                                "DD/MM/YYYY"
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="success.main"
                              fontWeight={600}
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {formatCurrency(contrato.valor_total)}
                            </Typography>

                            {contrato.data_fim && (
                              <Typography variant="caption" color="warning.main">
                                Vence: {dayjs(contrato.data_fim).format("DD/MM/YY")}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  fontWeight="bold"
                  mb={3}
                  color="primary.main"
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                >
                  🚀 Ações Rápidas
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/licitacoes")}
                      sx={{
                        py: { xs: 1.3, sm: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                        },
                      }}
                    >
                      Nova Licitação
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/contratos")}
                      sx={{
                        py: { xs: 1.3, sm: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                        },
                      }}
                    >
                      Novo Contrato
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      startIcon={<AssessmentIcon />}
                      onClick={() => navigate("/relatorios")}
                      sx={{
                        py: { xs: 1.3, sm: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      Relatórios
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      color="warning"
                      startIcon={<NotificationsActiveIcon />}
                      onClick={() => navigate("/notificacoes")}
                      sx={{
                        py: { xs: 1.3, sm: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      Notificações
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          textAlign: "center",
          py: 2,
          px: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          color: "text.secondary",
          backgroundColor: "#fff",
        }}
      >
        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
          Desenvolvido pelo 3º Sgt Cador - Auxiliar SALC
        </Typography>
      </Box>
    </Box>
  );
}