import { useState } from "react";
import { API_URL } from "../config/api";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";

import { FileUp, Upload } from "lucide-react";

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

  input: "#0F1115",
  inputBorder: "#353B47",

  successBackground: "rgba(59, 130, 246, 0.12)",
  successText: "#60A5FA",

  errorBackground: "rgba(239, 68, 68, 0.12)",
  errorText: "#F87171",
};

/* =========================================================
   HISTÓRICO
========================================================= */

const historicoImportacoesMock = [
  {
    id: "1",
    arquivo: "notas_dia_15_09_2026.xlsx",
    data: "15/09/2026 08:30",
    registros: "142 notas",
    status: "Sucesso",
    usuario: "carlos.admin@empresa.com",
  },
  {
    id: "2",
    arquivo: "notas_dia_14_09_2026.xlsx",
    data: "14/09/2026 08:15",
    registros: "118 notas",
    status: "Sucesso",
    usuario: "carlos.admin@empresa.com",
  },
  {
    id: "3",
    arquivo: "notas_dia_13_09_2026.xlsx",
    data: "13/09/2026 09:00",
    registros: "95 notas",
    status: "Atenção (2 erros)",
    usuario: "carlos.admin@empresa.com",
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export function Importar() {
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [enviando, setEnviando] = useState(false);

  const [sucessoMsg, setSucessoMsg] = useState("");

  const [erroMsg, setErroMsg] = useState("");

  /* =======================================================
     SELEÇÃO DO ARQUIVO
  ======================================================= */

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setArquivo(file);
    setSucessoMsg("");
    setErroMsg("");
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!arquivo) {
      return;
    }

    setEnviando(true);
    setSucessoMsg("");
    setErroMsg("");

    const formData = new FormData();

    formData.append("file", arquivo);

    try {
      const response = await fetch(`${API_URL}/api/importar-planilha`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErroMsg(data.error || "Erro ao importar a planilha.");

        return;
      }

      setSucessoMsg(data.message || "Planilha importada com sucesso!");

      setArquivo(null);

      const inputElement = document.getElementById(
        "file-upload",
      ) as HTMLInputElement | null;

      if (inputElement) {
        inputElement.value = "";
      }
    } catch (error) {
      console.error("Erro na requisição:", error);

      setErroMsg("Falha ao conectar com o servidor Fastify.");
    } finally {
      setEnviando(false);
    }
  }

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

      <Box mb="24px">
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
            <FileUp size={20} strokeWidth={1.8} />
          </Box>

          <Heading
            fontSize="22px"
            fontWeight="600"
            color={COLORS.text}
            letterSpacing="-0.02em"
          >
            Importação de Planilhas
          </Heading>
        </Flex>

        <Text fontSize="13.5px" color={COLORS.textSecondary} mt="6px">
          Carregue o arquivo `.xlsx` diário para processar as notas fiscais no
          banco Neon.
        </Text>
      </Box>

      {/* ===================================================
          CARD DE UPLOAD
      =================================================== */}

      <Card.Root
        p={{ base: "20px", lg: "28px" }}
        mb="32px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        boxShadow="none"
      >
        <form onSubmit={handleUpload}>
          <VStack align="stretch" gap="16px" maxW="700px">
            {/* Campo */}

            <Box>
              <label
                htmlFor="file-upload"
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: COLORS.textSecondary,
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
              >
                Selecionar arquivo de notas (.xlsx)
              </label>

              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                h="46px"
                p="8px"
                fontSize="13.5px"
                color={COLORS.text}
                bg={COLORS.input}
                borderColor={COLORS.inputBorder}
                _file={{
                  color: COLORS.textSecondary,
                  bg: COLORS.cardHover,
                  border: "none",
                  borderRadius: "6px",
                  px: "10px",
                  mr: "10px",
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

            {/* Arquivo selecionado */}

            {arquivo && (
              <Flex
                align="center"
                gap="10px"
                px="12px"
                py="10px"
                borderRadius="8px"
                bg={COLORS.blueSoft}
                border="1px solid"
                borderColor="rgba(59, 130, 246, 0.2)"
              >
                <Upload size={17} color={COLORS.blue} strokeWidth={1.8} />

                <Box minW={0}>
                  <Text fontSize="12px" color={COLORS.textMuted}>
                    Arquivo selecionado
                  </Text>

                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color={COLORS.text}
                    truncate
                  >
                    {arquivo.name}
                  </Text>
                </Box>
              </Flex>
            )}

            {/* Sucesso */}

            {sucessoMsg && (
              <Box
                bg={COLORS.successBackground}
                color={COLORS.successText}
                p="12px"
                borderRadius="8px"
                fontSize="13.5px"
                border="1px solid"
                borderColor="rgba(59, 130, 246, 0.2)"
                fontWeight="500"
              >
                {sucessoMsg}
              </Box>
            )}

            {/* Erro */}

            {erroMsg && (
              <Box
                bg={COLORS.errorBackground}
                color={COLORS.errorText}
                p="12px"
                borderRadius="8px"
                fontSize="13.5px"
                border="1px solid"
                borderColor="rgba(239, 68, 68, 0.2)"
                fontWeight="500"
              >
                {erroMsg}
              </Box>
            )}

            {/* Botão */}

            <Flex align="center" gap="12px" pt="4px">
              <Button
                type="submit"
                disabled={!arquivo || enviando}
                h="44px"
                px="24px"
                bg={COLORS.blue}
                color="white"
                fontWeight="600"
                fontSize="13.5px"
                borderRadius="8px"
                _hover={{
                  bg: COLORS.blueHover,
                }}
                _disabled={{
                  opacity: 0.45,
                  cursor: "not-allowed",
                }}
              >
                <Upload size={17} strokeWidth={1.8} />

                {enviando ? "Processando planilha..." : "Importar Planilha"}
              </Button>
            </Flex>
          </VStack>
        </form>
      </Card.Root>

      {/* ===================================================
          HISTÓRICO - TÍTULO
      =================================================== */}

      <Box mb="16px">
        <Heading fontSize="17px" fontWeight="600" color={COLORS.text}>
          Histórico de Importações Recentes
        </Heading>

        <Text fontSize="13px" color={COLORS.textSecondary}>
          Registro dos arquivos carregados nos últimos dias pelo sistema.
        </Text>
      </Box>

      {/* ===================================================
          HISTÓRICO - TABELA
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
                  Arquivo
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data / Hora
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Volume
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Responsável
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Status
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            {/* Corpo */}

            <Table.Body>
              {historicoImportacoesMock.map((item) => {
                const sucesso = item.status === "Sucesso";

                return (
                  <Table.Row key={item.id}>
                    {/* Arquivo */}

                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color={COLORS.blue}
                      fontSize="13.5px"
                    >
                      {item.arquivo}
                    </Table.Cell>

                    {/* Data */}

                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      color={COLORS.textSecondary}
                      fontSize="13px"
                    >
                      {item.data}
                    </Table.Cell>

                    {/* Volume */}

                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color={COLORS.text}
                      fontSize="13px"
                    >
                      {item.registros}
                    </Table.Cell>

                    {/* Responsável */}

                    <Table.Cell color={COLORS.textSecondary} fontSize="13px">
                      {item.usuario}
                    </Table.Cell>

                    {/* Status */}

                    <Table.Cell textAlign="center">
                      <Box
                        as="span"
                        display="inline-flex"
                        alignItems="center"
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={
                          sucesso
                            ? COLORS.successBackground
                            : "rgba(245, 158, 11, 0.12)"
                        }
                        color={sucesso ? COLORS.successText : "#FBBF24"}
                      >
                        {item.status}
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Box>
  );
}
