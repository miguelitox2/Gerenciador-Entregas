import { useState } from "react";
import { API_URL } from "../config/api";
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Table,
  Badge,
  Card,
  VStack,
} from "@chakra-ui/react";

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

export function Importar() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState("");
  const [erroMsg, setErroMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
      setSucessoMsg("");
      setErroMsg("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) return;

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

      if (response.ok) {
        setSucessoMsg(data.message || "Planilha importada com sucesso!");
        setArquivo(null);
        // Reseta o input file se necessário
        const inputElement = document.getElementById(
          "file-upload",
        ) as HTMLInputElement;
        if (inputElement) inputElement.value = "";
      } else {
        setErroMsg(data.error || "Erro ao importar a planilha.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErroMsg("Falha ao conectar com o servidor Fastify.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box p={{ base: "20px", lg: "32px" }} maxW="1400px" mx="auto">
      <Flex
        justify="space-between"
        align="center"
        mb="24px"
        wrap="wrap"
        gap="16px"
      >
        <Box>
          <Heading
            fontSize="22px"
            fontWeight="600"
            color="#12281E"
            letterSpacing="-0.02em"
          >
            Importação de Planilhas
          </Heading>
          <Text fontSize="13.5px" color="#5A6E63" mt="2px">
            Carregue o arquivo `.xlsx` diário para processar as notas fiscais no
            banco Neon.
          </Text>
        </Box>
      </Flex>

      <Card.Root
        p={{ base: "20px", lg: "28px" }}
        mb="32px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor="#DCE3DB"
        bg="white"
      >
        <form onSubmit={handleUpload}>
          <VStack align="stretch" gap="16px" maxW="600px">
            <Box>
              <Text
                as="label"
                display="block"
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.09em"
                textTransform="uppercase"
                color="#4C5D55"
                mb="8px"
              >
                Selecionar arquivo de notas (.xlsx)
              </Text>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                h="46px"
                p="8px"
                fontSize="13.5px"
                borderColor="#C3CFC2"
                bg="#FAFCFA"
                _focus={{
                  borderColor: "#1F6B4A",
                  boxShadow: "0 0 0 3px rgba(31,107,74,.14)",
                }}
              />
            </Box>

            {sucessoMsg && (
              <Box
                bg="#E1F3EA"
                color="#1B653B"
                p="12px"
                borderRadius="8px"
                fontSize="13.5px"
                border="1px solid #B8E4C8"
                fontWeight="500"
              >
                {sucessoMsg}
              </Box>
            )}

            {erroMsg && (
              <Box
                bg="#FEECEB"
                color="#A61C1C"
                p="12px"
                borderRadius="8px"
                fontSize="13.5px"
                border="1px solid #F8B4B0"
                fontWeight="500"
              >
                {erroMsg}
              </Box>
            )}

            <Flex align="center" gap="12px">
              <Button
                type="submit"
                disabled={!arquivo || enviando}
                h="44px"
                px="24px"
                bg="#1F6B4A"
                color="white"
                fontWeight="600"
                fontSize="13.5px"
                borderRadius="8px"
                _hover={{ bg: "#134936" }}
                _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                {enviando ? "Processando planilha..." : "Importar Planilha"}
              </Button>
              {arquivo && (
                <Text fontSize="13px" color="#5A6E63">
                  Arquivo pronto: <b>{arquivo.name}</b>
                </Text>
              )}
            </Flex>
          </VStack>
        </form>
      </Card.Root>

      <Box mb="16px">
        <Heading fontSize="17px" fontWeight="600" color="#12281E">
          Histórico de Importações Recentes
        </Heading>
        <Text fontSize="13px" color="#5A6E63">
          Registro dos arquivos carregados nos últimos dias pelo sistema.
        </Text>
      </Box>

      <Card.Root
        borderRadius="10px"
        borderWidth="1px"
        borderColor="#DCE3DB"
        bg="white"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table.Root size="sm" variant="line">
            <Table.Header bg="#F7F9F8">
              <Table.Row>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Arquivo
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data / Hora
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Volume
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Responsável
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Status
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {historicoImportacoesMock.map((item) => (
                <Table.Row key={item.id} _hover={{ bg: "#FAFCFA" }}>
                  <Table.Cell
                    fontVariantNumeric="tabular-nums"
                    fontWeight="600"
                    color="#1F6B4A"
                    fontSize="13.5px"
                  >
                    {item.arquivo}
                  </Table.Cell>
                  <Table.Cell
                    fontVariantNumeric="tabular-nums"
                    color="#4C5D55"
                    fontSize="13px"
                  >
                    {item.data}
                  </Table.Cell>
                  <Table.Cell
                    fontVariantNumeric="tabular-nums"
                    fontWeight="600"
                    color="#12281E"
                    fontSize="13px"
                  >
                    {item.registros}
                  </Table.Cell>
                  <Table.Cell color="#5A6E63" fontSize="13px">
                    {item.usuario}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Badge
                      px="8px"
                      py="3px"
                      borderRadius="full"
                      fontSize="11px"
                      fontWeight="600"
                      bg={item.status === "Sucesso" ? "#E1F3EA" : "#FDF3E3"}
                      color={item.status === "Sucesso" ? "#1B653B" : "#8C5A00"}
                    >
                      {item.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Box>
  );
}
