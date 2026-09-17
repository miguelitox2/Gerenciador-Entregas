import { useState, useEffect } from "react";
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
  HStack,
  Card,
  Spinner,
} from "@chakra-ui/react";

interface NotaItem {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

interface Nota {
  numeroNf: string;
  numeroNfOriginal: string;
  placa?: string;
  peso?: number;
  valor?: number;
  cliente?: string;
  cidade?: string;
  motorista?: string;
  importadoEm: string;
  itens?: NotaItem[];
}

export function Buscar() {
  const [termo, setTermo] = useState("");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca as notas reais do backend Fastify ao carregar a página
  useEffect(() => {
    fetch(`${API_URL}/api/notas`)
      .then((res) => res.json())
      .then((data) => {
        if (data.notas) {
          setNotas(data.notas);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar notas fiscais:", err);
        setLoading(false);
      });
  }, []);

  // Filtra as notas pelo termo digitado (NF, cliente ou cidade)
  const notasFiltradas = notas.filter((item) => {
    const search = termo.toLowerCase();
    const nf = item.numeroNf?.toLowerCase() || "";
    const cliente = item.cliente?.toLowerCase() || "";
    const cidade = item.cidade?.toLowerCase() || "";

    return (
      nf.includes(search) || cliente.includes(search) || cidade.includes(search)
    );
  });

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
            Busca de Notas Fiscais
          </Heading>
          <Text fontSize="13.5px" color="#5A6E63" mt="2px">
            Consulte o status das entregas e notas importadas diretamente do
            banco de dados.
          </Text>
        </Box>
      </Flex>

      <Card.Root
        p="16px"
        mb="24px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor="#DCE3DB"
        bg="white"
      >
        <Flex gap="12px" wrap="wrap">
          <Input
            placeholder="Pesquisar por número da NF, cliente ou cidade..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            maxW="480px"
            h="42px"
            fontSize="13.5px"
            borderColor="#C3CFC2"
            _focus={{
              borderColor: "#1F6B4A",
              boxShadow: "0 0 0 3px rgba(31,107,74,.14)",
            }}
          />
          <Button
            h="42px"
            px="20px"
            bg="#1F6B4A"
            color="white"
            fontWeight="600"
            fontSize="13.5px"
            _hover={{ bg: "#134936" }}
          >
            Pesquisar
          </Button>
        </Flex>
      </Card.Root>

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
                  NF
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Cliente / Destino
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data Importação
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Valor
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
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Ações
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Spinner size="md" color="#1F6B4A" />
                    <Text mt="2" fontSize="13px" color="#6E8277">
                      Carregando notas do sistema...
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : notasFiltradas.length > 0 ? (
                notasFiltradas.map((item) => {
                  const dataFormatada = new Date(
                    item.importadoEm,
                  ).toLocaleDateString("pt-BR");
                  const valorFormatado = Number(item.valor || 0).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    },
                  );

                  return (
                    <Table.Row key={item.numeroNf} _hover={{ bg: "#FAFCFA" }}>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color="#1F6B4A"
                      >
                        #{item.numeroNf}
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          fontWeight="600"
                          color="#12281E"
                          fontSize="13.5px"
                        >
                          {item.cliente || "Cliente não informado"}
                        </Text>
                        <Text fontSize="12px" color="#6E8277">
                          {item.cidade || "Cidade não informada"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        color="#4C5D55"
                        fontSize="13px"
                      >
                        {dataFormatada}
                      </Table.Cell>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        textAlign="right"
                        color="#12281E"
                        fontSize="13px"
                      >
                        {valorFormatado}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Badge
                          px="8px"
                          py="3px"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="600"
                          bg="#E1F3EA"
                          color="#1B653B"
                        >
                          Ativa
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <HStack justify="flex-end" gap="8px">
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor="#C3CFC2"
                            color="#1F6B4A"
                            _hover={{ bg: "#EBF3EF" }}
                          >
                            Ver detalhes
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    textAlign="center"
                    py="40px"
                    color="#6E8277"
                  >
                    Nenhuma nota fiscal encontrada no banco de dados.
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
