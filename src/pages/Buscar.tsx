import { useState } from "react";
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
} from "@chakra-ui/react";

const notasFiscaisMock = [
  {
    id: "1",
    nf: "48291",
    cliente: "Supermercado Compre Bem Ltda",
    cidade: "Campinas - SP",
    data: "14/09/2026",
    valor: "R$ 14.580,00",
    status: "Entregue",
  },
  {
    id: "2",
    nf: "48292",
    cliente: "Comercial Alimentos São José",
    cidade: "Jundiaí - SP",
    data: "14/09/2026",
    valor: "R$ 8.920,50",
    status: "Com Ocorrência",
  },
  {
    id: "3",
    nf: "48293",
    cliente: "Atacadista Bom Preço S/A",
    cidade: "Sorocaba - SP",
    data: "13/09/2026",
    valor: "R$ 32.100,00",
    status: "Retido",
  },
  {
    id: "4",
    nf: "48294",
    cliente: "Distribuidora Central Hortifrúti",
    cidade: "Piracicaba - SP",
    data: "13/09/2026",
    valor: "R$ 5.430,00",
    status: "Entregue",
  },
];

export function Buscar() {
  const [termo, setTermo] = useState("");

  const notasFiltradas = notasFiscaisMock.filter(
    (item) =>
      item.nf.includes(termo) ||
      item.cliente.toLowerCase().includes(termo.toLowerCase()) ||
      item.cidade.toLowerCase().includes(termo.toLowerCase()),
  );

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
            Consulte rapidamente o status das entregas e notas cadastradas no
            sistema.
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
                  Data
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
              {notasFiltradas.length > 0 ? (
                notasFiltradas.map((item) => (
                  <Table.Row key={item.id} _hover={{ bg: "#FAFCFA" }}>
                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color="#1F6B4A"
                    >
                      #{item.nf}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="600" color="#12281E" fontSize="13.5px">
                        {item.cliente}
                      </Text>
                      <Text fontSize="12px" color="#6E8277">
                        {item.cidade}
                      </Text>
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
                      textAlign="right"
                      color="#12281E"
                      fontSize="13px"
                    >
                      {item.valor}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Badge
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={
                          item.status === "Entregue"
                            ? "#E1F3EA"
                            : item.status === "Com Ocorrência"
                              ? "#FDF3E3"
                              : "#FEECEB"
                        }
                        color={
                          item.status === "Entregue"
                            ? "#1B653B"
                            : item.status === "Com Ocorrência"
                              ? "#8C5A00"
                              : "#A61C1C"
                        }
                      >
                        {item.status}
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
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    textAlign="center"
                    py="40px"
                    color="#6E8277"
                  >
                    Nenhuma nota fiscal encontrada para o termo pesquisado.
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
