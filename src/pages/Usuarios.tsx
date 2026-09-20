import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  Portal,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";

import { UserPlus, Users, X, Mail, BriefcaseBusiness } from "lucide-react";

import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

type FormData = {
  nome: string;
  cargo: string;
  email: string;
  senha: string;
};

type Usuario = {
  id: string;
  name: string;
  cargo: string;
  email: string;
  createdAt: string;
};

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  background: "#0F1115",

  card: "#111318",
  cardHover: "#181B21",

  border: "#252932",
  borderSoft: "#20232A",
  borderHover: "#343A46",

  text: "#F1F5F9",
  textSecondary: "#A1A8B3",
  textMuted: "#69717E",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.10)",

  danger: "#F87171",
  dangerSoft: "rgba(239, 68, 68, 0.10)",

  input: "#0F1115",
  inputBorder: "#353B47",
};

/* =========================================================
   FORMULÁRIO
========================================================= */

const initialForm: FormData = {
  nome: "",
  cargo: "",
  email: "",
  senha: "",
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [form, setForm] = useState<FormData>(initialForm);

  const [modalAberto, setModalAberto] = useState(false);

  const [loading, setLoading] = useState(false);

  const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);

  const [mensagem, setMensagem] = useState("");

  const [erro, setErro] = useState("");

  /* =======================================================
     CARREGAR USUÁRIOS
  ======================================================= */

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setCarregandoUsuarios(true);

      const response = await fetch(`${API_URL}/api/users`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar os usuários.");
      }

      setUsuarios(data.users || []);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao carregar usuários.",
      );
    } finally {
      setCarregandoUsuarios(false);
    }
  }

  /* =======================================================
     FORMULÁRIO
  ======================================================= */

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* =======================================================
     MODAL
  ======================================================= */

  function abrirModal() {
    setForm(initialForm);
    setMensagem("");
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (loading) return;

    setModalAberto(false);
    setForm(initialForm);
    setMensagem("");
    setErro("");
  }

  /* =======================================================
     CRIAR USUÁRIO
  ======================================================= */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (
      !form.nome.trim() ||
      !form.cargo.trim() ||
      !form.email.trim() ||
      !form.senha
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.nome.trim(),
          cargo: form.cargo.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível criar o usuário.");
      }

      setMensagem("Usuário criado com sucesso!");

      await carregarUsuarios();

      setTimeout(() => {
        setModalAberto(false);
        setForm(initialForm);
        setMensagem("");
      }, 700);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao criar usuário.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      minH="100%"
      p={{
        base: "20px",
        md: "28px",
        lg: "34px",
      }}
      bg={COLORS.background}
    >
      <Box maxW="1200px" mx="auto">
        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <Flex
          align={{
            base: "flex-start",
            md: "center",
          }}
          justify="space-between"
          gap="16px"
          mb="26px"
          direction={{
            base: "column",
            sm: "row",
          }}
        >
          <Box>
            <Flex align="center" gap="10px">
              <Flex
                w="34px"
                h="34px"
                align="center"
                justify="center"
                borderRadius="9px"
                bg={COLORS.blueSoft}
                color={COLORS.blue}
              >
                <Users size={18} strokeWidth={1.8} />
              </Flex>

              <Box>
                <Heading
                  fontSize={{
                    base: "19px",
                    md: "21px",
                  }}
                  fontWeight="600"
                  letterSpacing="-0.02em"
                  color={COLORS.text}
                >
                  Usuários
                </Heading>
              </Box>
            </Flex>

            <Text mt="7px" fontSize="12.5px" color={COLORS.textMuted}>
              Gerencie os acessos ao sistema.
            </Text>
          </Box>

          <Button
            h="40px"
            px="14px"
            bg={COLORS.blue}
            color="white"
            borderRadius="8px"
            fontSize="12.5px"
            fontWeight="600"
            onClick={abrirModal}
            _hover={{
              bg: COLORS.blueHover,
              transform: "translateY(-1px)",
            }}
            transition="all 0.18s ease"
          >
            <UserPlus size={16} strokeWidth={1.8} />
            Novo usuário
          </Button>
        </Flex>

        {/* =================================================
            RESUMO
        ================================================= */}

        <Flex align="center" gap="8px" mb="12px">
          <Text
            fontSize="11px"
            fontWeight="700"
            color={COLORS.textMuted}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Usuários cadastrados
          </Text>

          <Flex
            minW="24px"
            h="20px"
            px="6px"
            align="center"
            justify="center"
            borderRadius="full"
            bg={COLORS.blueSoft}
            color={COLORS.blue}
            fontSize="10px"
            fontWeight="700"
          >
            {usuarios.length}
          </Flex>
        </Flex>

        {/* =================================================
            TABELA
        ================================================= */}

        <Card.Root
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="10px"
          bg={COLORS.card}
          boxShadow="none"
          overflow="hidden"
        >
          <Card.Body p={0}>
            {carregandoUsuarios ? (
              <Flex minH="180px" align="center" justify="center">
                <Text color={COLORS.textMuted} fontSize="12.5px">
                  Carregando usuários...
                </Text>
              </Flex>
            ) : usuarios.length === 0 ? (
              <Flex
                minH="220px"
                direction="column"
                align="center"
                justify="center"
                gap="10px"
              >
                <Flex
                  w="42px"
                  h="42px"
                  align="center"
                  justify="center"
                  borderRadius="10px"
                  bg={COLORS.blueSoft}
                  color={COLORS.textMuted}
                >
                  <Users size={20} strokeWidth={1.5} />
                </Flex>

                <Box textAlign="center">
                  <Text
                    color={COLORS.textSecondary}
                    fontSize="13px"
                    fontWeight="500"
                  >
                    Nenhum usuário cadastrado
                  </Text>

                  <Text mt="3px" color={COLORS.textMuted} fontSize="11px">
                    Crie o primeiro usuário para começar.
                  </Text>
                </Box>
              </Flex>
            ) : (
              <Box
                overflowX="auto"
                css={{
                  "& table": {
                    backgroundColor: COLORS.card,
                  },

                  "& th": {
                    backgroundColor: COLORS.card,
                    color: COLORS.textMuted,
                    borderColor: COLORS.border,
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  },

                  "& td": {
                    backgroundColor: COLORS.card,
                    color: COLORS.text,
                    borderColor: COLORS.borderSoft,
                  },

                  "& tbody tr": {
                    transition: "background-color 0.18s ease",
                  },

                  "& tbody tr:hover td": {
                    backgroundColor: COLORS.cardHover,
                  },
                }}
              >
                <Table.Root variant="line" size="md">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Nome</Table.ColumnHeader>

                      <Table.ColumnHeader>Cargo</Table.ColumnHeader>

                      <Table.ColumnHeader>E-mail</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {usuarios.map((usuario) => (
                      <Table.Row key={usuario.id}>
                        {/* Nome */}

                        <Table.Cell py="14px">
                          <Flex align="center" gap="10px">
                            <Flex
                              w="30px"
                              h="30px"
                              align="center"
                              justify="center"
                              flexShrink={0}
                              borderRadius="8px"
                              bg={COLORS.blueSoft}
                              color={COLORS.blue}
                              fontSize="11px"
                              fontWeight="700"
                            >
                              {usuario.name.charAt(0).toUpperCase()}
                            </Flex>

                            <Text
                              fontSize="13px"
                              fontWeight="600"
                              color={COLORS.text}
                            >
                              {usuario.name}
                            </Text>
                          </Flex>
                        </Table.Cell>

                        {/* Cargo */}

                        <Table.Cell>
                          <Box
                            as="span"
                            display="inline-flex"
                            alignItems="center"
                            gap="5px"
                            px="8px"
                            py="4px"
                            borderRadius="full"
                            bg={COLORS.blueSoft}
                            color={COLORS.blue}
                            fontSize="10px"
                            fontWeight="600"
                          >
                            <BriefcaseBusiness size={11} strokeWidth={1.8} />

                            {usuario.cargo}
                          </Box>
                        </Table.Cell>

                        {/* E-mail */}

                        <Table.Cell>
                          <Flex
                            align="center"
                            gap="7px"
                            color={COLORS.textSecondary}
                            fontSize="12px"
                          >
                            <Mail
                              size={13}
                              strokeWidth={1.7}
                              color={COLORS.textMuted}
                            />

                            {usuario.email}
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      </Box>

      {/* ===================================================
          MODAL
      =================================================== */}

      <Dialog.Root
        open={modalAberto}
        onOpenChange={(details) => {
          if (!details.open) {
            fecharModal();
          }
        }}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.72)"
            backdropFilter="blur(3px)"
          />

          <Dialog.Positioner>
            <Dialog.Content
              bg={COLORS.card}
              border="1px solid"
              borderColor={COLORS.border}
              borderRadius="12px"
              boxShadow="0 24px 70px rgba(0,0,0,.45)"
              color={COLORS.text}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <Dialog.Header
                px="22px"
                pt="20px"
                pb="17px"
                borderBottom="1px solid"
                borderColor={COLORS.border}
              >
                <Flex align="center" gap="10px">
                  <Flex
                    w="32px"
                    h="32px"
                    align="center"
                    justify="center"
                    borderRadius="8px"
                    bg={COLORS.blueSoft}
                    color={COLORS.blue}
                  >
                    <UserPlus size={17} strokeWidth={1.8} />
                  </Flex>

                  <Box>
                    <Dialog.Title
                      color={COLORS.text}
                      fontSize="16px"
                      fontWeight="600"
                    >
                      Criar novo usuário
                    </Dialog.Title>

                    <Text mt="2px" fontSize="11px" color={COLORS.textMuted}>
                      Informe os dados de acesso.
                    </Text>
                  </Box>
                </Flex>

                <Dialog.CloseTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    minW="30px"
                    h="30px"
                    p={0}
                    color={COLORS.textMuted}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    <X size={16} strokeWidth={1.8} />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>

              {/* =================================================
                  FORMULÁRIO
              ================================================= */}

              <Dialog.Body px="22px" py="20px">
                <form id="form-criar-usuario" onSubmit={handleSubmit}>
                  <Stack gap="16px">
                    {/* Nome */}

                    <Field.Root>
                      <Field.Label
                        color={COLORS.textSecondary}
                        fontSize="11px"
                        fontWeight="600"
                        mb="6px"
                      >
                        Nome
                      </Field.Label>

                      <Input
                        value={form.nome}
                        onChange={(event) =>
                          handleChange("nome", event.target.value)
                        }
                        placeholder="Digite o nome completo"
                        size="md"
                        borderRadius="8px"
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
                    </Field.Root>

                    {/* Cargo */}

                    <Field.Root>
                      <Field.Label
                        color={COLORS.textSecondary}
                        fontSize="11px"
                        fontWeight="600"
                        mb="6px"
                      >
                        Cargo
                      </Field.Label>

                      <Input
                        value={form.cargo}
                        onChange={(event) =>
                          handleChange("cargo", event.target.value)
                        }
                        placeholder="Ex.: Administrador"
                        size="md"
                        borderRadius="8px"
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
                    </Field.Root>

                    {/* E-mail */}

                    <Field.Root>
                      <Field.Label
                        color={COLORS.textSecondary}
                        fontSize="11px"
                        fontWeight="600"
                        mb="6px"
                      >
                        E-mail
                      </Field.Label>

                      <Input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          handleChange("email", event.target.value)
                        }
                        placeholder="usuario@empresa.com"
                        size="md"
                        borderRadius="8px"
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
                    </Field.Root>

                    {/* Senha */}

                    <Field.Root>
                      <Field.Label
                        color={COLORS.textSecondary}
                        fontSize="11px"
                        fontWeight="600"
                        mb="6px"
                      >
                        Senha
                      </Field.Label>

                      <Input
                        type="password"
                        value={form.senha}
                        onChange={(event) =>
                          handleChange("senha", event.target.value)
                        }
                        placeholder="Digite uma senha"
                        size="md"
                        borderRadius="8px"
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
                    </Field.Root>

                    {/* Erro */}

                    {erro && (
                      <Box
                        px="11px"
                        py="9px"
                        borderRadius="8px"
                        bg={COLORS.dangerSoft}
                        border="1px solid"
                        borderColor="rgba(239, 68, 68, 0.18)"
                      >
                        <Text color={COLORS.danger} fontSize="11.5px">
                          {erro}
                        </Text>
                      </Box>
                    )}

                    {/* Sucesso */}

                    {mensagem && (
                      <Box
                        px="11px"
                        py="9px"
                        borderRadius="8px"
                        bg={COLORS.blueSoft}
                        border="1px solid"
                        borderColor="rgba(59, 130, 246, 0.18)"
                      >
                        <Text color={COLORS.blue} fontSize="11.5px">
                          {mensagem}
                        </Text>
                      </Box>
                    )}
                  </Stack>
                </form>
              </Dialog.Body>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <Dialog.Footer
                px="22px"
                py="16px"
                borderTop="1px solid"
                borderColor={COLORS.border}
              >
                <HStack gap="8px">
                  <Button
                    type="button"
                    variant="outline"
                    borderRadius="8px"
                    borderColor={COLORS.borderHover}
                    color={COLORS.textSecondary}
                    disabled={loading}
                    onClick={fecharModal}
                    _hover={{
                      bg: COLORS.cardHover,
                      borderColor: COLORS.borderHover,
                      color: COLORS.text,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    form="form-criar-usuario"
                    bg={COLORS.blue}
                    color="white"
                    borderRadius="8px"
                    loading={loading}
                    loadingText="Criando..."
                    _hover={{
                      bg: COLORS.blueHover,
                    }}
                  >
                    <UserPlus size={15} strokeWidth={1.8} />
                    Criar usuário
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
