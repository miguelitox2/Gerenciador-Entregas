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

import { UserPlus, Users, X } from "lucide-react";

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
  cardHover: "#1A1D24",

  border: "#252932",
  borderHover: "#353B47",

  text: "#F1F5F9",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.12)",

  danger: "#F87171",
  dangerSoft: "rgba(239, 68, 68, 0.12)",

  input: "#0F1115",
  inputBorder: "#353B47",
};

/* =========================================================
   FORMULÁRIO INICIAL
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
     ALTERAR FORMULÁRIO
  ======================================================= */

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* =======================================================
     ABRIR MODAL
  ======================================================= */

  function abrirModal() {
    setForm(initialForm);
    setMensagem("");
    setErro("");
    setModalAberto(true);
  }

  /* =======================================================
     FECHAR MODAL
  ======================================================= */

  function fecharModal() {
    if (loading) {
      return;
    }

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
      p={{ base: "20px", lg: "32px" }}
      maxW="1400px"
      mx="auto"
      bg={COLORS.background}
    >
      <Box maxW="1100px" mx="auto">
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
          mb="24px"
          direction={{
            base: "column",
            md: "row",
          }}
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
                <Users size={20} strokeWidth={1.8} />
              </Box>

              <Heading
                fontSize="22px"
                fontWeight="600"
                color={COLORS.text}
                letterSpacing="-0.02em"
              >
                Usuários cadastrados
              </Heading>
            </Flex>

            <Text fontSize="13.5px" color={COLORS.textSecondary} mt="6px">
              Gerencie os acessos ao sistema.
            </Text>
          </Box>

          <Button
            h="42px"
            px="16px"
            bg={COLORS.blue}
            color="white"
            borderRadius="8px"
            fontSize="13.5px"
            fontWeight="600"
            onClick={abrirModal}
            _hover={{
              bg: COLORS.blueHover,
            }}
          >
            <UserPlus size={17} strokeWidth={1.8} />
            Novo usuário
          </Button>
        </Flex>

        {/* =================================================
            LISTA DE USUÁRIOS
        ================================================= */}

        <Card.Root
          borderWidth="1px"
          borderColor={COLORS.border}
          borderRadius="10px"
          bg={COLORS.card}
          boxShadow="none"
          overflow="hidden"
        >
          <Card.Body p={0}>
            {carregandoUsuarios ? (
              <Flex minH="180px" align="center" justify="center">
                <Text color={COLORS.textSecondary} fontSize="13px">
                  Carregando usuários...
                </Text>
              </Flex>
            ) : usuarios.length === 0 ? (
              <Flex
                minH="220px"
                direction="column"
                align="center"
                justify="center"
                gap="8px"
              >
                <Users size={24} strokeWidth={1.5} color={COLORS.textMuted} />

                <Text color={COLORS.textSecondary} fontSize="13px">
                  Nenhum usuário cadastrado.
                </Text>
              </Flex>
            ) : (
              <Box
                overflowX="auto"
                css={{
                  "& table": {
                    backgroundColor: COLORS.card,
                  },

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
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
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
                        <Table.Cell>
                          <Text
                            fontWeight="600"
                            color={COLORS.text}
                            fontSize="13.5px"
                          >
                            {usuario.name}
                          </Text>
                        </Table.Cell>

                        <Table.Cell>
                          <Box
                            as="span"
                            display="inline-flex"
                            alignItems="center"
                            px="9px"
                            py="4px"
                            borderRadius="full"
                            bg={COLORS.blueSoft}
                            color={COLORS.blue}
                            fontSize="11px"
                            fontWeight="600"
                          >
                            {usuario.cargo}
                          </Box>
                        </Table.Cell>

                        <Table.Cell
                          color={COLORS.textSecondary}
                          fontSize="13px"
                        >
                          {usuario.email}
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
                  CABEÇALHO DO MODAL
              ================================================= */}

              <Dialog.Header
                px="24px"
                pt="22px"
                pb="18px"
                borderBottom="1px solid"
                borderColor={COLORS.border}
              >
                <Box>
                  <Flex align="center" gap="10px">
                    <Box
                      w="34px"
                      h="34px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="8px"
                      bg={COLORS.blueSoft}
                      color={COLORS.blue}
                    >
                      <UserPlus size={18} strokeWidth={1.8} />
                    </Box>

                    <Box>
                      <Dialog.Title
                        color={COLORS.text}
                        fontSize="17px"
                        fontWeight="600"
                      >
                        Criar novo usuário
                      </Dialog.Title>

                      <Text
                        fontSize="12px"
                        color={COLORS.textSecondary}
                        mt="2px"
                      >
                        Informe os dados de acesso do novo usuário.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                <Dialog.CloseTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    minW="32px"
                    h="32px"
                    p={0}
                    color={COLORS.textMuted}
                    _hover={{
                      bg: COLORS.cardHover,
                      color: COLORS.text,
                    }}
                  >
                    <X size={17} strokeWidth={1.8} />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>

              {/* =================================================
                  CORPO
              ================================================= */}

              <Dialog.Body px="24px" py="22px">
                <form id="form-criar-usuario" onSubmit={handleSubmit}>
                  <Stack gap="18px">
                    {/* Nome */}

                    <Field.Root>
                      <Field.Label
                        color={COLORS.textSecondary}
                        fontSize="12px"
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
                        size="lg"
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
                        fontSize="12px"
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
                        size="lg"
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
                        fontSize="12px"
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
                        size="lg"
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
                        fontSize="12px"
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
                        size="lg"
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
                        px="12px"
                        py="10px"
                        borderRadius="8px"
                        bg={COLORS.dangerSoft}
                        border="1px solid"
                        borderColor="rgba(239, 68, 68, 0.2)"
                      >
                        <Text color={COLORS.danger} fontSize="12.5px">
                          {erro}
                        </Text>
                      </Box>
                    )}

                    {/* Sucesso */}

                    {mensagem && (
                      <Box
                        px="12px"
                        py="10px"
                        borderRadius="8px"
                        bg={COLORS.blueSoft}
                        border="1px solid"
                        borderColor="rgba(59, 130, 246, 0.2)"
                      >
                        <Text
                          color={COLORS.blue}
                          fontSize="12.5px"
                          fontWeight="500"
                        >
                          {mensagem}
                        </Text>
                      </Box>
                    )}
                  </Stack>
                </form>
              </Dialog.Body>

              {/* =================================================
                  RODAPÉ
              ================================================= */}

              <Dialog.Footer
                px="24px"
                py="18px"
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
                      borderColor: "#4B5563",
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
                    <UserPlus size={16} strokeWidth={1.8} />
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
