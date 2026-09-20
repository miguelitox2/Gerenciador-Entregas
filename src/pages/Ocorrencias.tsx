import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";

import { AlertTriangle, ClipboardList, Search } from "lucide-react";

import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

interface Ocorrencia {
  id: string;
  numeroNf: string;
  cliente?: string;
  motivo: string;
  observacao?: string;
  totalValor?: number;
  criadoEm: string;
}

/* =========================================================
   CORES DO SISTEMA
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

  input: "#0F1115",
  inputBorder: "#353B47",
};

/* =========================================================
   COMPONENTE
========================================================= */

export function Ocorrencias() {
  const [termo, setTermo] = useState("");

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     CARREGAR OCORRÊNCIAS
  ======================================================= */

  useEffect(() => {
    async function carregarOcorrencias() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/ocorrencias`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Não foi possível carregar as ocorrências.",
          );
        }

        setOcorrencias(data.ocorrencias || []);
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarOcorrencias();
  }, []);

  /* =======================================================
     FILTRO
  ======================================================= */

  const termoBusca = termo.trim().toLowerCase();

  const ocorrenciasFiltradas = ocorrencias.filter((item) => {
    const numeroNf = item.numeroNf?.toLowerCase() || "";

    const cliente = item.cliente?.toLowerCase() || "";

    const motivo = item.motivo?.toLowerCase() || "";

    return (
      numeroNf.includes(termoBusca) ||
      cliente.includes(termoBusca) ||
      motivo.includes(termoBusca)
    );
  });

  /* =======================================================
     CÁLCULOS
  ======================================================= */

  const totalMes = ocorrencias.length;

  const valorTotalAfetado = ocorrencias.reduce(
    (acc, curr) => acc + (curr.totalValor || 0),
    0,
  );

  const valorFormatadoTotal = valorTotalAfetado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      minH="100%"
      p={{ base: "20px", lg: "32px" }}
      maxW="1400px"
      mx="auto"
      bg={COLORS.background}
    >
      {/* ===================================================
          CABEÇALHO
      =================================================== */}

      <Flex
        justify="space-between"
        align="center"
        mb="24px"
        wrap="wrap"
        gap="16px"
      >
        <Box>
          <Flex align="center" gap="10px">
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

            <Heading
              fontSize="22px"
              fontWeight="600"
              color={COLORS.text}
              letterSpacing="-0.02em"
            >
              Painel de Ocorrências
            </Heading>
          </Flex>

          <Text fontSize="13.5px" color={COLORS.textSecondary} mt="6px">
            Gerencie desvios, quebras, devoluções e divergências de entrega da
            operação.
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
        {/* Total */}

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
            mb="4px"
          >
            Total no Mês
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.text}
            fontVariantNumeric="tabular-nums"
          >
            {totalMes} registros
          </Text>
        </Card.Root>

        {/* Pendentes */}

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
            mb="4px"
          >
            Pendentes de Ação
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.warning}
            fontVariantNumeric="tabular-nums"
          >
            {totalMes} ocorrências
          </Text>
        </Card.Root>

        {/* Valor afetado */}

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
            mb="4px"
          >
            Valor Afetado
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.text}
            fontVariantNumeric="tabular-nums"
          >
            {valorFormatadoTotal}
          </Text>
        </Card.Root>

        {/* Resolvidas */}

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
            mb="4px"
          >
            Resolvidas
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.blue}
            fontVariantNumeric="tabular-nums"
          >
            0 ocorrências
          </Text>
        </Card.Root>
      </SimpleGrid>

      {/* ===================================================
          FILTRO
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
          <Box position="relative" maxW="480px" w="100%">
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
              placeholder="Filtrar por número da NF, cliente ou motivo..."
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
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

              "& tbody tr:hover": {
                backgroundColor: COLORS.cardHover,
              },

              "& tbody tr:hover td": {
                backgroundColor: COLORS.cardHover,
              },
            }}
          >
            {/* Cabeçalho */}

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  NF
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Cliente / Motivo
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Valor
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Status
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Ações
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            {/* Corpo */}

            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Flex direction="column" align="center" gap="8px">
                      <Spinner size="md" color={COLORS.blue} />

                      <Text fontSize="13px" color={COLORS.textSecondary}>
                        Carregando ocorrências do sistema...
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((item) => {
                  const dataFormatada = new Date(
                    item.criadoEm,
                  ).toLocaleDateString("pt-BR");

                  const valorFormatado = Number(
                    item.totalValor || 0,
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

                  return (
                    <Table.Row key={item.id}>
                      {/* NF */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color={COLORS.blue}
                      >
                        #{item.numeroNf}
                      </Table.Cell>

                      {/* Cliente / Motivo */}

                      <Table.Cell>
                        <Text
                          fontWeight="600"
                          color={COLORS.text}
                          fontSize="13.5px"
                        >
                          {item.cliente || "Cliente não informado"}
                        </Text>

                        <Text fontSize="12px" color={COLORS.textMuted}>
                          {item.motivo}
                        </Text>
                      </Table.Cell>

                      {/* Data */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        color={COLORS.textSecondary}
                        fontSize="13px"
                      >
                        {dataFormatada}
                      </Table.Cell>

                      {/* Valor */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        textAlign="right"
                        color={COLORS.text}
                        fontSize="13px"
                      >
                        {valorFormatado}
                      </Table.Cell>

                      {/* Status */}

                      <Table.Cell textAlign="center">
                        <Badge
                          px="8px"
                          py="3px"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="600"
                          bg={COLORS.warningSoft}
                          color={COLORS.warning}
                        >
                          Pendente
                        </Badge>
                      </Table.Cell>

                      {/* Ações */}

                      <Table.Cell textAlign="right">
                        <HStack justify="flex-end" gap="8px">
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor={COLORS.borderHover}
                            color={COLORS.textSecondary}
                            _hover={{
                              bg: COLORS.cardHover,
                              borderColor: "#4B5563",
                              color: COLORS.text,
                            }}
                          >
                            Detalhes / Outlook
                          </Button>
                        </HStack>
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

                      <Text color={COLORS.textMuted} fontSize="13px">
                        Nenhuma ocorrência encontrada no banco de dados.
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Box>
  );
}
