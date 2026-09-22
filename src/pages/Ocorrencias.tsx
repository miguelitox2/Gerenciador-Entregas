import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  Textarea,
} from "@chakra-ui/react";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MessageSquare,
  PackageSearch,
  Search,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

type StatusOcorrencia = "pendente" | "finalizado";

type FiltroStatus = "todos" | StatusOcorrencia;

interface ItemOcorrencia {
  id?: string;
  codigo?: string;
  descricao?: string;

  quantidade?: number;

  pesoLiquido?: number;
  pesoOriginal?: number;
  pesoDevolvido?: number;

  valorUnitario?: number;
  valorTotal?: number;
  valorDevolucao?: number;
}

interface ComentarioOcorrencia {
  id: string;
  ocorrenciaId: string;
  comentario: string;
  criadoPor: string;
  criadoPorEmail?: string | null;
  criadoEm: string;
}

interface UsuarioAtual {
  nome: string;
  email: string;
}

interface Ocorrencia {
  id: string;

  numeroNf: string;
  numeroNfOriginal?: string;

  placa?: string | null;
  cliente?: string | null;
  vendedor?: string | null;
  motorista?: string | null;
  cidade?: string | null;

  motivo: string;
  observacao?: string | null;

  unidade?: string | null;

  itens?: ItemOcorrencia[] | null;

  totalQtd?: number;
  totalPeso?: number;
  totalValor?: number;

  valorNota?: number;
  pesoNota?: number;

  para?: string | null;
  cc?: string | null;

  criadoPor?: {
    nome?: string;
    email?: string;
  } | null;

  criadoPorEmail?: string;

  dataRef?: string;

  criadoEm: string;

  status?: StatusOcorrencia | null;

  finalizadoEm?: string | null;

  finalizadoPor?: {
    nome?: string;
    email?: string;
  } | null;

  comentarios?: ComentarioOcorrencia[];
}

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  background: "#0F1115",

  card: "#111318",
  cardHover: "#1A1D24",

  border: "#252932",
  borderHover: "#353B47",

  text: "#F1F5F9",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.12)",

  warning: "#FBBF24",
  warningSoft: "rgba(245, 158, 11, 0.12)",

  success: "#34D399",
  successSoft: "rgba(52, 211, 153, 0.12)",

  danger: "#F87171",
  dangerSoft: "rgba(248, 113, 113, 0.12)",

  input: "#0F1115",
  inputBorder: "#353B47",
};

/* =========================================================
   HELPERS
========================================================= */

function formatarMoeda(valor: number | null | undefined) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarNumero(valor: number | null | undefined) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  });
}

function formatarData(valor?: string | null) {
  if (!valor) {
    return "-";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "-";
  }

  return data.toLocaleDateString("pt-BR");
}

function formatarDataHora(valor?: string | null) {
  if (!valor) {
    return "-";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "-";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizarStatus(status?: string | null): StatusOcorrencia {
  return status === "finalizado" ? "finalizado" : "pendente";
}

/*
 * Mantemos o retorno explicitamente tipado.
 *
 * Isso evita o erro do fetch:
 *
 * Type '{ Authorization: string; } | ...'
 * is not assignable to HeadersInit
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function getUsuarioAtual(): UsuarioAtual {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return {
        nome: "Sistema",
        email: "admin@sistema.com",
      };
    }

    const usuario = JSON.parse(raw);

    return {
      nome: usuario?.name || usuario?.nome || "Sistema",

      email: usuario?.email || "admin@sistema.com",
    };
  } catch {
    return {
      nome: "Sistema",
      email: "admin@sistema.com",
    };
  }
}

/* =========================================================
   COMPONENTE
========================================================= */

export function Ocorrencias() {
  /* =======================================================
     ESTADOS
  ======================================================= */

  const [termo, setTermo] = useState("");

  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>("todos");

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const [loading, setLoading] = useState(true);

  const [detalhesAberto, setDetalhesAberto] = useState(false);

  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<Ocorrencia | null>(null);

  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const [finalizando, setFinalizando] = useState(false);

  const [comentario, setComentario] = useState("");

  const [adicionandoComentario, setAdicionandoComentario] = useState(false);

  /*
   * Modal próprio de confirmação.
   *
   * Substitui completamente o window.confirm().
   */

  const [confirmarFinalizacaoAberto, setConfirmarFinalizacaoAberto] =
    useState(false);

  /* =======================================================
     CARREGAR OCORRÊNCIAS
  ======================================================= */

  const carregarOcorrencias = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/ocorrencias`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível carregar as ocorrências.",
        );
      }

      setOcorrencias(Array.isArray(data.ocorrencias) ? data.ocorrencias : []);
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar ocorrências.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  /* =======================================================
     FILTROS
  ======================================================= */

  const ocorrenciasFiltradas = useMemo(() => {
    const busca = termo.trim().toLowerCase();

    return ocorrencias.filter((item) => {
      const nf = item.numeroNf?.toLowerCase() || "";

      const cliente = item.cliente?.toLowerCase() || "";

      const motivo = item.motivo?.toLowerCase() || "";

      const correspondeTexto =
        !busca ||
        nf.includes(busca) ||
        cliente.includes(busca) ||
        motivo.includes(busca);

      const status = normalizarStatus(item.status);

      const correspondeStatus =
        statusFiltro === "todos" || status === statusFiltro;

      return correspondeTexto && correspondeStatus;
    });
  }, [ocorrencias, termo, statusFiltro]);

  /* =======================================================
     RESUMOS
  ======================================================= */

  const totalOcorrencias = ocorrencias.length;

  const totalPendentes = ocorrencias.filter(
    (item) => normalizarStatus(item.status) === "pendente",
  ).length;

  const totalFinalizadas = ocorrencias.filter(
    (item) => normalizarStatus(item.status) === "finalizado",
  ).length;

  const valorTotalAfetado = ocorrencias.reduce(
    (total, item) => total + Number(item.totalValor || 0),
    0,
  );

  /* =======================================================
     ABRIR DETALHES
  ======================================================= */

  const abrirDetalhes = async (id: string) => {
    try {
      setCarregandoDetalhes(true);

      setDetalhesAberto(true);

      setComentario("");

      const response = await fetch(`${API_URL}/api/ocorrencias/${id}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar os detalhes.");
      }

      setOcorrenciaSelecionada(data.ocorrencia);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);

      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar detalhes.",
      );

      setDetalhesAberto(false);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  /* =======================================================
     FECHAR DETALHES
  ======================================================= */

  const fecharDetalhes = () => {
    if (finalizando || adicionandoComentario) {
      return;
    }

    /*
     * Se o modal de confirmação estiver
     * aberto, ele é fechado separadamente.
     */

    if (confirmarFinalizacaoAberto) {
      return;
    }

    setDetalhesAberto(false);

    setOcorrenciaSelecionada(null);

    setComentario("");
  };

  /* =======================================================
     ABRIR CONFIRMAÇÃO
  ======================================================= */

  const abrirConfirmacaoFinalizacao = () => {
    if (!ocorrenciaSelecionada) {
      return;
    }

    if (normalizarStatus(ocorrenciaSelecionada.status) === "finalizado") {
      return;
    }

    setConfirmarFinalizacaoAberto(true);
  };

  /* =======================================================
     FECHAR CONFIRMAÇÃO
  ======================================================= */

  const fecharConfirmacaoFinalizacao = () => {
    if (finalizando) {
      return;
    }

    setConfirmarFinalizacaoAberto(false);
  };

  /* =======================================================
     FINALIZAR OCORRÊNCIA
  ======================================================= */

  const finalizarOcorrencia = async () => {
    if (!ocorrenciaSelecionada) {
      return;
    }

    if (normalizarStatus(ocorrenciaSelecionada.status) === "finalizado") {
      return;
    }

    try {
      setFinalizando(true);

      const usuario = getUsuarioAtual();

      const response = await fetch(
        `${API_URL}/api/ocorrencias/${ocorrenciaSelecionada.id}/finalizar`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            ...getAuthHeaders(),
          },

          body: JSON.stringify({
            finalizadoPor: {
              nome: usuario.nome,

              email: usuario.email,
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível finalizar a ocorrência.",
        );
      }

      const atualizada = data.ocorrencia as Ocorrencia;

      /*
       * Atualiza os detalhes.
       */

      setOcorrenciaSelecionada(atualizada);

      /*
       * Atualiza a tabela.
       */

      setOcorrencias((listaAtual) =>
        listaAtual.map((item) =>
          item.id === atualizada.id
            ? {
                ...item,
                ...atualizada,
              }
            : item,
        ),
      );

      /*
       * Fecha o modal de confirmação.
       */

      setConfirmarFinalizacaoAberto(false);

      toast.success("Ocorrência finalizada com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar ocorrência:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao finalizar ocorrência.",
      );
    } finally {
      setFinalizando(false);
    }
  };

  /* =======================================================
     ADICIONAR COMENTÁRIO
  ======================================================= */

  const adicionarComentario = async () => {
    if (!ocorrenciaSelecionada) {
      return;
    }

    const texto = comentario.trim();

    if (!texto) {
      toast.warning("Digite um comentário antes de adicionar.");

      return;
    }

    try {
      setAdicionandoComentario(true);

      const usuario = getUsuarioAtual();

      const response = await fetch(
        `${API_URL}/api/ocorrencias/${ocorrenciaSelecionada.id}/comentarios`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...getAuthHeaders(),
          },

          body: JSON.stringify({
            comentario: texto,

            criadoPor: usuario.nome,

            criadoPorEmail: usuario.email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível adicionar o comentário.",
        );
      }

      setOcorrenciaSelecionada((atual) => {
        if (!atual) {
          return atual;
        }

        return {
          ...atual,

          comentarios: [...(atual.comentarios || []), data.comentario],
        };
      });

      setComentario("");

      toast.success("Comentário adicionado.");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar comentário.",
      );
    } finally {
      setAdicionandoComentario(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      minH="100%"
      p={{
        base: "20px",
        lg: "32px",
      }}
      maxW="1400px"
      mx="auto"
      bg={COLORS.background}
      color={COLORS.text}
    >
      {/* ===================================================
          CABEÇALHO
      =================================================== */}

      <Flex align="center" gap="10px" mb="24px">
        <Box
          w="36px"
          h="36px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="9px"
          bg={COLORS.blueSoft}
          color={COLORS.blue}
        >
          <ClipboardList size={20} strokeWidth={1.8} />
        </Box>

        <Box>
          <Heading
            fontSize="22px"
            fontWeight="600"
            color={COLORS.text}
            letterSpacing="-0.02em"
          >
            Painel de Ocorrências
          </Heading>

          <Text fontSize="13px" color={COLORS.textSecondary} mt="4px">
            Gerencie desvios, quebras, devoluções e divergências da operação.
          </Text>
        </Box>
      </Flex>

      {/* ===================================================
          CARDS DE RESUMO
      =================================================== */}

      <SimpleGrid
        columns={{
          base: 1,
          sm: 2,
          lg: 4,
        }}
        gap="16px"
        mb="24px"
      >
        {/* TOTAL */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={COLORS.textSecondary}
          >
            Total
          </Text>

          <Text mt="6px" fontSize="24px" fontWeight="600">
            {totalOcorrencias}
          </Text>

          <Text mt="3px" fontSize="12px" color={COLORS.textMuted}>
            ocorrências registradas
          </Text>
        </Card.Root>

        {/* PENDENTES */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={COLORS.textSecondary}
              >
                Pendentes
              </Text>

              <Text
                mt="6px"
                fontSize="24px"
                fontWeight="600"
                color={COLORS.warning}
              >
                {totalPendentes}
              </Text>
            </Box>

            <Clock3 size={18} color={COLORS.warning} />
          </Flex>

          <Text mt="3px" fontSize="12px" color={COLORS.textMuted}>
            aguardando resolução
          </Text>
        </Card.Root>

        {/* FINALIZADAS */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={COLORS.textSecondary}
              >
                Finalizadas
              </Text>

              <Text
                mt="6px"
                fontSize="24px"
                fontWeight="600"
                color={COLORS.success}
              >
                {totalFinalizadas}
              </Text>
            </Box>

            <CheckCircle2 size={18} color={COLORS.success} />
          </Flex>

          <Text mt="3px" fontSize="12px" color={COLORS.textMuted}>
            ocorrências resolvidas
          </Text>
        </Card.Root>

        {/* VALOR */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={COLORS.textSecondary}
          >
            Valor afetado
          </Text>

          <Text mt="6px" fontSize="20px" fontWeight="600">
            {formatarMoeda(valorTotalAfetado)}
          </Text>

          <Text mt="3px" fontSize="12px" color={COLORS.textMuted}>
            valor total registrado
          </Text>
        </Card.Root>
      </SimpleGrid>

      {/* ===================================================
          FILTROS
      =================================================== */}

      <Card.Root
        p="16px"
        mb="24px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        boxShadow="none"
      >
        <Flex gap="12px" wrap="wrap">
          {/* BUSCA */}

          <Box
            position="relative"
            flex="1"
            minW={{
              base: "100%",
              md: "320px",
            }}
          >
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              color={COLORS.textMuted}
              zIndex={1}
              pointerEvents="none"
            >
              <Search size={17} strokeWidth={1.8} />
            </Box>

            <Input
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
              placeholder="Buscar por NF, cliente ou motivo..."
              h="42px"
              pl="38px"
              fontSize="13.5px"
              color={COLORS.text}
              bg={COLORS.input}
              borderColor={COLORS.inputBorder}
              _placeholder={{
                color: COLORS.textMuted,
              }}
              _hover={{
                borderColor: COLORS.borderHover,
              }}
              _focus={{
                borderColor: COLORS.blue,
                boxShadow: `0 0 0 3px ${COLORS.blueSoft}`,
              }}
            />
          </Box>

          {/* FILTRO DE STATUS */}

          <select
            value={statusFiltro}
            onChange={(event) => {
              const valor = event.target.value;

              if (
                valor === "todos" ||
                valor === "pendente" ||
                valor === "finalizado"
              ) {
                setStatusFiltro(valor);
              }
            }}
            style={{
              width: "190px",
              height: "42px",
              padding: "0 12px",
              border: `1px solid ${COLORS.inputBorder}`,
              borderRadius: "6px",
              background: COLORS.input,
              color: COLORS.text,
              fontSize: "13.5px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option
              value="todos"
              style={{
                background: COLORS.input,
                color: COLORS.text,
              }}
            >
              Todos os status
            </option>

            <option
              value="pendente"
              style={{
                background: COLORS.input,
                color: COLORS.text,
              }}
            >
              Pendentes
            </option>

            <option
              value="finalizado"
              style={{
                background: COLORS.input,
                color: COLORS.text,
              }}
            >
              Finalizadas
            </option>
          </select>
        </Flex>
      </Card.Root>

      {/* ===================================================
          TABELA
      =================================================== */}

      <Card.Root
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        overflow="hidden"
        boxShadow="none"
      >
        <Box overflowX="auto" bg={COLORS.card}>
          <Table.Root
            size="sm"
            variant="line"
            bg={COLORS.card}
            color={COLORS.text}
            css={{
              "& thead": {
                backgroundColor: COLORS.cardHover,
              },

              "& tbody": {
                backgroundColor: COLORS.card,
              },

              "& tr": {
                backgroundColor: COLORS.card,
              },

              "& th": {
                backgroundColor: COLORS.cardHover,
                color: COLORS.textSecondary,
                borderColor: COLORS.border,
              },

              "& td": {
                backgroundColor: COLORS.card,
                color: COLORS.text,
                borderColor: COLORS.border,
              },

              "& tbody tr:hover td": {
                backgroundColor: COLORS.cardHover,
              },
            }}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>NF</Table.ColumnHeader>

                <Table.ColumnHeader>Cliente / Motivo</Table.ColumnHeader>

                <Table.ColumnHeader>Data</Table.ColumnHeader>

                <Table.ColumnHeader textAlign="right">Valor</Table.ColumnHeader>

                <Table.ColumnHeader textAlign="center">
                  Status
                </Table.ColumnHeader>

                <Table.ColumnHeader textAlign="right">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Flex direction="column" align="center" gap="8px">
                      <Spinner size="md" color={COLORS.blue} />

                      <Text fontSize="13px" color={COLORS.textSecondary}>
                        Carregando ocorrências...
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((item) => {
                  const status = normalizarStatus(item.status);

                  return (
                    <Table.Row key={item.id}>
                      {/* NF */}

                      <Table.Cell
                        fontWeight="600"
                        color={COLORS.blue}
                        fontVariantNumeric="tabular-nums"
                      >
                        #{item.numeroNf}
                      </Table.Cell>

                      {/* CLIENTE / MOTIVO */}

                      <Table.Cell>
                        <Text
                          fontWeight="600"
                          fontSize="13.5px"
                          color={COLORS.text}
                        >
                          {item.cliente || "Cliente não informado"}
                        </Text>

                        <Text mt="2px" fontSize="12px" color={COLORS.textMuted}>
                          {item.motivo}
                        </Text>
                      </Table.Cell>

                      {/* DATA */}

                      <Table.Cell
                        fontSize="13px"
                        color={COLORS.textSecondary}
                        fontVariantNumeric="tabular-nums"
                      >
                        {formatarData(item.criadoEm)}
                      </Table.Cell>

                      {/* VALOR */}

                      <Table.Cell
                        textAlign="right"
                        fontSize="13px"
                        fontWeight="600"
                        fontVariantNumeric="tabular-nums"
                      >
                        {formatarMoeda(item.totalValor)}
                      </Table.Cell>

                      {/* STATUS */}

                      <Table.Cell textAlign="center">
                        <Badge
                          px="8px"
                          py="3px"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="600"
                          bg={
                            status === "finalizado"
                              ? COLORS.successSoft
                              : COLORS.warningSoft
                          }
                          color={
                            status === "finalizado"
                              ? COLORS.success
                              : COLORS.warning
                          }
                        >
                          {status === "finalizado" ? "Finalizado" : "Pendente"}
                        </Badge>
                      </Table.Cell>

                      {/* AÇÕES */}

                      <Table.Cell textAlign="right">
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor={COLORS.borderHover}
                          color={COLORS.textSecondary}
                          onClick={() => abrirDetalhes(item.id)}
                          _hover={{
                            bg: COLORS.cardHover,
                            borderColor: COLORS.blue,
                            color: COLORS.text,
                          }}
                        >
                          Detalhes
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Flex direction="column" align="center" gap="8px">
                      <AlertTriangle
                        size={22}
                        color={COLORS.textMuted}
                        strokeWidth={1.6}
                      />

                      <Text fontSize="13px" color={COLORS.textMuted}>
                        Nenhuma ocorrência encontrada.
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>

      {/* ===================================================
          MODAL — DETALHES DA OCORRÊNCIA
      =================================================== */}

      <Dialog.Root
        open={detalhesAberto}
        onOpenChange={(details) => {
          if (!details.open) {
            fecharDetalhes();
          }
        }}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.72)"
            backdropFilter="blur(3px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              backgroundColor={COLORS.card}
              color={COLORS.text}
              border="1px solid"
              borderColor={COLORS.border}
              borderRadius="14px"
              maxW={{
                base: "calc(100vw - 24px)",
                md: "900px",
              }}
              maxH="90vh"
              overflow="hidden"
            >
              {/* HEADER */}

              <Dialog.Header
                bg={COLORS.card}
                borderBottom="1px solid"
                borderColor={COLORS.border}
                px={{
                  base: "18px",
                  md: "24px",
                }}
                py="18px"
              >
                <Flex w="100%" align="center" justify="space-between">
                  <Flex align="center" gap="11px">
                    <Box
                      w="36px"
                      h="36px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="9px"
                      bg={COLORS.blueSoft}
                      color={COLORS.blue}
                    >
                      <PackageSearch size={19} />
                    </Box>

                    <Box>
                      <Dialog.Title
                        color={COLORS.text}
                        fontSize="17px"
                        fontWeight="600"
                      >
                        Detalhes da ocorrência
                      </Dialog.Title>

                      {ocorrenciaSelecionada && (
                        <Text mt="2px" fontSize="12px" color={COLORS.textMuted}>
                          NF #{ocorrenciaSelecionada.numeroNf}
                        </Text>
                      )}
                    </Box>
                  </Flex>

                  <Button
                    variant="ghost"
                    size="sm"
                    color={COLORS.textMuted}
                    onClick={fecharDetalhes}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    <X size={18} />
                  </Button>
                </Flex>
              </Dialog.Header>

              {/* BODY */}

              <Dialog.Body
                bg={COLORS.card}
                color={COLORS.text}
                overflowY="auto"
                px={{
                  base: "18px",
                  md: "24px",
                }}
                py="20px"
              >
                {carregandoDetalhes ? (
                  <Flex
                    minH="300px"
                    align="center"
                    justify="center"
                    direction="column"
                    gap="10px"
                  >
                    <Spinner color={COLORS.blue} />

                    <Text fontSize="13px" color={COLORS.textSecondary}>
                      Carregando detalhes...
                    </Text>
                  </Flex>
                ) : ocorrenciaSelecionada ? (
                  <Flex direction="column" gap="18px">
                    {/* STATUS / TIPO */}

                    <Flex gap="10px" wrap="wrap">
                      <Box
                        px="11px"
                        py="8px"
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                        bg={COLORS.cardHover}
                      >
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          letterSpacing="0.07em"
                          color={COLORS.textMuted}
                        >
                          STATUS
                        </Text>

                        <Badge
                          mt="4px"
                          px="7px"
                          py="3px"
                          borderRadius="full"
                          fontSize="10px"
                          bg={
                            normalizarStatus(ocorrenciaSelecionada.status) ===
                            "finalizado"
                              ? COLORS.successSoft
                              : COLORS.warningSoft
                          }
                          color={
                            normalizarStatus(ocorrenciaSelecionada.status) ===
                            "finalizado"
                              ? COLORS.success
                              : COLORS.warning
                          }
                        >
                          {normalizarStatus(ocorrenciaSelecionada.status) ===
                          "finalizado"
                            ? "Finalizado"
                            : "Pendente"}
                        </Badge>
                      </Box>

                      <Box
                        px="11px"
                        py="8px"
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                        bg={COLORS.cardHover}
                      >
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          letterSpacing="0.07em"
                          color={COLORS.textMuted}
                        >
                          TIPO DA OCORRÊNCIA
                        </Text>

                        <Text mt="4px" fontSize="12px" fontWeight="600">
                          {ocorrenciaSelecionada.motivo}
                        </Text>
                      </Box>
                    </Flex>

                    {/* DADOS DA ENTREGA */}

                    <SimpleGrid
                      columns={{
                        base: 1,
                        md: 2,
                      }}
                      gap="10px"
                    >
                      {[
                        ["CLIENTE", ocorrenciaSelecionada.cliente || "-"],
                        ["VENDEDOR", ocorrenciaSelecionada.vendedor || "-"],
                        ["MOTORISTA", ocorrenciaSelecionada.motorista || "-"],
                        ["CIDADE", ocorrenciaSelecionada.cidade || "-"],
                      ].map(([label, value]) => (
                        <Box
                          key={label}
                          p="12px"
                          bg={COLORS.input}
                          border="1px solid"
                          borderColor={COLORS.border}
                          borderRadius="8px"
                        >
                          <Text
                            fontSize="9px"
                            fontWeight="700"
                            letterSpacing="0.06em"
                            color={COLORS.textMuted}
                          >
                            {label}
                          </Text>

                          <Text mt="5px" fontSize="12.5px">
                            {value}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>

                    {/* RESUMO */}

                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 3,
                      }}
                      gap="10px"
                    >
                      <Box
                        p="12px"
                        bg={COLORS.input}
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                      >
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          color={COLORS.textMuted}
                        >
                          PESO AFETADO
                        </Text>

                        <Text mt="5px" fontSize="15px" fontWeight="600">
                          {formatarNumero(ocorrenciaSelecionada.totalPeso)}{" "}
                          {ocorrenciaSelecionada.unidade || "kg"}
                        </Text>
                      </Box>

                      <Box
                        p="12px"
                        bg={COLORS.input}
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                      >
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          color={COLORS.textMuted}
                        >
                          VALOR AFETADO
                        </Text>

                        <Text mt="5px" fontSize="15px" fontWeight="600">
                          {formatarMoeda(ocorrenciaSelecionada.totalValor)}
                        </Text>
                      </Box>

                      <Box
                        p="12px"
                        bg={COLORS.input}
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                      >
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          color={COLORS.textMuted}
                        >
                          REGISTRADO EM
                        </Text>

                        <Text mt="5px" fontSize="12px" fontWeight="600">
                          {formatarDataHora(ocorrenciaSelecionada.criadoEm)}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* ITENS ENVOLVIDOS */}

                    {Array.isArray(ocorrenciaSelecionada.itens) &&
                      ocorrenciaSelecionada.itens.length > 0 && (
                        <Box>
                          <Flex align="center" justify="space-between" mb="8px">
                            <Box>
                              <Text fontSize="12px" fontWeight="700">
                                Itens envolvidos
                              </Text>

                              <Text
                                mt="2px"
                                fontSize="11px"
                                color={COLORS.textMuted}
                              >
                                Somente os itens envolvidos neste registro.
                              </Text>
                            </Box>

                            <Badge
                              bg={COLORS.blueSoft}
                              color={COLORS.blue}
                              px="8px"
                              py="3px"
                              borderRadius="full"
                              fontSize="10px"
                            >
                              {ocorrenciaSelecionada.itens.length}{" "}
                              {ocorrenciaSelecionada.itens.length === 1
                                ? "item"
                                : "itens"}
                            </Badge>
                          </Flex>

                          <Box
                            overflowX="auto"
                            border="1px solid"
                            borderColor={COLORS.border}
                            borderRadius="8px"
                            overflow="hidden"
                          >
                            <Table.Root
                              size="sm"
                              variant="line"
                              bg={COLORS.card}
                              color={COLORS.text}
                              css={{
                                "& thead": {
                                  backgroundColor: COLORS.cardHover,
                                },

                                "& tbody": {
                                  backgroundColor: COLORS.card,
                                },

                                "& tr": {
                                  backgroundColor: COLORS.card,
                                },

                                "& th": {
                                  backgroundColor: COLORS.cardHover,
                                  color: COLORS.textSecondary,
                                  borderColor: COLORS.border,
                                },

                                "& td": {
                                  backgroundColor: COLORS.card,
                                  color: COLORS.text,
                                  borderColor: COLORS.border,
                                },

                                "& tbody tr:hover td": {
                                  backgroundColor: COLORS.cardHover,
                                },
                              }}
                            >
                              <Table.Header>
                                <Table.Row>
                                  <Table.ColumnHeader>
                                    CÓDIGO
                                  </Table.ColumnHeader>

                                  <Table.ColumnHeader>
                                    PRODUTO
                                  </Table.ColumnHeader>

                                  <Table.ColumnHeader textAlign="right">
                                    PESO
                                  </Table.ColumnHeader>

                                  <Table.ColumnHeader textAlign="right">
                                    VALOR
                                  </Table.ColumnHeader>
                                </Table.Row>
                              </Table.Header>

                              <Table.Body>
                                {ocorrenciaSelecionada.itens.map(
                                  (item, index) => (
                                    <Table.Row
                                      key={item.id || `${item.codigo}-${index}`}
                                    >
                                      <Table.Cell
                                        color={COLORS.blue}
                                        fontWeight="600"
                                        fontSize="12px"
                                      >
                                        {item.codigo || "-"}
                                      </Table.Cell>

                                      <Table.Cell fontSize="12px">
                                        {item.descricao || "-"}
                                      </Table.Cell>

                                      <Table.Cell
                                        textAlign="right"
                                        fontSize="12px"
                                      >
                                        {formatarNumero(
                                          item.pesoDevolvido ??
                                            item.pesoLiquido ??
                                            item.pesoOriginal ??
                                            0,
                                        )}{" "}
                                        {ocorrenciaSelecionada.unidade || "kg"}
                                      </Table.Cell>

                                      <Table.Cell
                                        textAlign="right"
                                        fontSize="12px"
                                        fontWeight="600"
                                      >
                                        {formatarMoeda(
                                          item.valorDevolucao ??
                                            item.valorTotal ??
                                            0,
                                        )}
                                      </Table.Cell>
                                    </Table.Row>
                                  ),
                                )}
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        </Box>
                      )}

                    {/* OBSERVAÇÃO */}

                    <Box>
                      <Text fontSize="12px" fontWeight="700" mb="7px">
                        Observação
                      </Text>

                      <Box
                        p="12px"
                        bg={COLORS.input}
                        border="1px solid"
                        borderColor={COLORS.border}
                        borderRadius="8px"
                      >
                        <Text
                          fontSize="12.5px"
                          lineHeight="1.6"
                          color={COLORS.textSecondary}
                          whiteSpace="pre-wrap"
                        >
                          {ocorrenciaSelecionada.observacao ||
                            "Nenhuma observação registrada."}
                        </Text>
                      </Box>
                    </Box>

                    {/* INFORMAÇÕES DA FINALIZAÇÃO */}

                    {normalizarStatus(ocorrenciaSelecionada.status) ===
                      "finalizado" && (
                      <Box
                        p="12px"
                        bg={COLORS.successSoft}
                        border="1px solid"
                        borderColor="rgba(52, 211, 153, 0.18)"
                        borderRadius="8px"
                      >
                        <Flex align="center" gap="9px">
                          <CheckCircle2 size={17} color={COLORS.success} />

                          <Box>
                            <Text
                              fontSize="12px"
                              fontWeight="600"
                              color={COLORS.success}
                            >
                              Ocorrência finalizada
                            </Text>

                            <Text
                              mt="2px"
                              fontSize="11px"
                              color={COLORS.textSecondary}
                            >
                              {ocorrenciaSelecionada.finalizadoPor?.nome ||
                                "Sistema"}{" "}
                              ·{" "}
                              {formatarDataHora(
                                ocorrenciaSelecionada.finalizadoEm,
                              )}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    )}

                    {/* COMENTÁRIOS */}

                    <Box>
                      <Flex align="center" gap="7px" mb="8px">
                        <MessageSquare size={15} color={COLORS.textSecondary} />

                        <Text fontSize="12px" fontWeight="700">
                          Comentários
                        </Text>
                      </Flex>

                      <Flex direction="column" gap="8px">
                        {(ocorrenciaSelecionada.comentarios || []).length ===
                        0 ? (
                          <Text fontSize="11px" color={COLORS.textMuted}>
                            Nenhum comentário registrado.
                          </Text>
                        ) : (
                          ocorrenciaSelecionada.comentarios?.map((item) => (
                            <Box
                              key={item.id}
                              p="11px"
                              bg={COLORS.input}
                              border="1px solid"
                              borderColor={COLORS.border}
                              borderRadius="8px"
                            >
                              <Flex justify="space-between" gap="12px" mb="4px">
                                <Text fontSize="11px" fontWeight="600">
                                  {item.criadoPor}
                                </Text>

                                <Text fontSize="10px" color={COLORS.textMuted}>
                                  {formatarDataHora(item.criadoEm)}
                                </Text>
                              </Flex>

                              <Text
                                fontSize="12px"
                                color={COLORS.textSecondary}
                                whiteSpace="pre-wrap"
                              >
                                {item.comentario}
                              </Text>
                            </Box>
                          ))
                        )}
                      </Flex>

                      <Flex mt="10px" gap="8px" align="flex-end">
                        <Textarea
                          value={comentario}
                          onChange={(event) =>
                            setComentario(event.target.value)
                          }
                          placeholder="Adicionar comentário..."
                          minH="70px"
                          resize="vertical"
                          bg={COLORS.input}
                          borderColor={COLORS.inputBorder}
                          color={COLORS.text}
                          fontSize="12px"
                          _placeholder={{
                            color: COLORS.textMuted,
                          }}
                          _focus={{
                            borderColor: COLORS.blue,
                            boxShadow: `0 0 0 3px ${COLORS.blueSoft}`,
                          }}
                        />

                        <Button
                          h="40px"
                          flexShrink={0}
                          bg={COLORS.blue}
                          color="white"
                          loading={adicionandoComentario}
                          onClick={adicionarComentario}
                          _hover={{
                            bg: COLORS.blueHover,
                          }}
                        >
                          Adicionar
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                ) : null}
              </Dialog.Body>

              {/* FOOTER */}

              <Dialog.Footer
                bg={COLORS.card}
                borderTop="1px solid"
                borderColor={COLORS.border}
                px={{
                  base: "18px",
                  md: "24px",
                }}
                py="14px"
              >
                <Flex
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap="10px"
                >
                  <Button
                    variant="outline"
                    borderColor={COLORS.borderHover}
                    color={COLORS.textSecondary}
                    disabled={finalizando || adicionandoComentario}
                    onClick={fecharDetalhes}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    Fechar
                  </Button>

                  {ocorrenciaSelecionada &&
                    normalizarStatus(ocorrenciaSelecionada.status) ===
                      "pendente" && (
                      <Button
                        bg={COLORS.success}
                        color="#06120D"
                        fontWeight="600"
                        loading={finalizando}
                        onClick={abrirConfirmacaoFinalizacao}
                        _hover={{
                          bg: "#2CCB8D",
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Finalizar ocorrência
                      </Button>
                    )}
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ===================================================
          MODAL — CONFIRMAR FINALIZAÇÃO
      =================================================== */}

      <Dialog.Root
        open={confirmarFinalizacaoAberto}
        onOpenChange={(details) => {
          if (!details.open) {
            fecharConfirmacaoFinalizacao();
          }
        }}
        size="sm"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.78)"
            backdropFilter="blur(4px)"
            zIndex={1500}
          />

          <Dialog.Positioner zIndex={1501}>
            <Dialog.Content
              backgroundColor={COLORS.card}
              color={COLORS.text}
              border="1px solid"
              borderColor={COLORS.border}
              borderRadius="14px"
              maxW={{
                base: "calc(100vw - 32px)",
                sm: "420px",
              }}
              overflow="hidden"
            >
              {/* HEADER */}

              <Dialog.Header
                bg={COLORS.card}
                borderBottom="1px solid"
                borderColor={COLORS.border}
                px="20px"
                py="17px"
              >
                <Flex align="center" justify="space-between" w="100%">
                  <Flex align="center" gap="11px">
                    <Box
                      w="36px"
                      h="36px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="9px"
                      bg={COLORS.warningSoft}
                      color={COLORS.warning}
                    >
                      <CheckCircle2 size={19} strokeWidth={1.8} />
                    </Box>

                    <Box>
                      <Dialog.Title
                        color={COLORS.text}
                        fontSize="16px"
                        fontWeight="600"
                      >
                        Finalizar ocorrência
                      </Dialog.Title>

                      <Text mt="2px" fontSize="11px" color={COLORS.textMuted}>
                        Confirmação de ação
                      </Text>
                    </Box>
                  </Flex>

                  <Button
                    variant="ghost"
                    size="sm"
                    color={COLORS.textMuted}
                    disabled={finalizando}
                    onClick={fecharConfirmacaoFinalizacao}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    <X size={17} />
                  </Button>
                </Flex>
              </Dialog.Header>

              {/* BODY */}

              <Dialog.Body
                bg={COLORS.card}
                color={COLORS.text}
                px="20px"
                py="20px"
              >
                <Text
                  fontSize="13px"
                  lineHeight="1.6"
                  color={COLORS.textSecondary}
                >
                  Deseja realmente finalizar esta ocorrência?
                </Text>

                {ocorrenciaSelecionada && (
                  <Box
                    mt="14px"
                    p="12px"
                    bg={COLORS.input}
                    border="1px solid"
                    borderColor={COLORS.border}
                    borderRadius="8px"
                  >
                    <Flex justify="space-between" align="center" gap="12px">
                      <Box>
                        <Text
                          fontSize="9px"
                          fontWeight="700"
                          letterSpacing="0.07em"
                          color={COLORS.textMuted}
                        >
                          NOTA FISCAL
                        </Text>

                        <Text
                          mt="3px"
                          fontSize="13px"
                          fontWeight="600"
                          color={COLORS.text}
                        >
                          #{ocorrenciaSelecionada.numeroNf}
                        </Text>
                      </Box>

                      <Badge
                        bg={COLORS.warningSoft}
                        color={COLORS.warning}
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="10px"
                      >
                        Pendente
                      </Badge>
                    </Flex>
                  </Box>
                )}

                <Text
                  mt="14px"
                  fontSize="11px"
                  lineHeight="1.5"
                  color={COLORS.textMuted}
                >
                  Após a confirmação, esta ocorrência será marcada como
                  finalizada no sistema.
                </Text>
              </Dialog.Body>

              {/* FOOTER */}

              <Dialog.Footer
                bg={COLORS.card}
                borderTop="1px solid"
                borderColor={COLORS.border}
                px="20px"
                py="14px"
              >
                <Flex w="100%" justify="flex-end" gap="9px">
                  <Button
                    variant="outline"
                    borderColor={COLORS.borderHover}
                    color={COLORS.textSecondary}
                    disabled={finalizando}
                    onClick={fecharConfirmacaoFinalizacao}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    bg={COLORS.success}
                    color="#06120D"
                    fontWeight="600"
                    loading={finalizando}
                    onClick={finalizarOcorrencia}
                    _hover={{
                      bg: "#2CCB8D",
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Finalizar ocorrência
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
