import {
  Box,
  Flex,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Search,
  ClipboardList,
  Truck,
  FileDown,
  Users,
  Menu,
  PackageCheck,
  LogOut,
  ChevronRight,
  RefreshCw,
  FolderArchive,
} from "lucide-react";

/* =========================================================
   TIPOS
========================================================= */

interface User {
  id: string;
  name: string;
  email: string;
}

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  background: "#0F1115",

  sidebar: "#111318",
  sidebarHover: "#181B21",
  sidebarActive: "#191D25",

  border: "#252932",
  borderSoft: "#20232A",

  text: "#F1F5F9",
  textSecondary: "#A1A8B3",
  textMuted: "#69717E",

  blue: "#3B82F6",
  blueSoft: "rgba(59, 130, 246, 0.10)",
  blueAvatar: "rgba(59, 130, 246, 0.13)",
};

/* =========================================================
   MENU
========================================================= */

const MENU_ITEMS = [
  {
    section: "Operação",
    path: "/buscar",
    label: "Buscar NF",
    icon: Search,
  },
  {
    section: "Operação",
    path: "/ocorrencias",
    label: "Ocorrências",
    icon: ClipboardList,
  },
  {
    section: "Operação",
    path: "/retencao",
    label: "Retenção",
    icon: Truck,
  },
  {
    section: "Operação",
    path: "/reentregas",
    label: "Reentregas",
    icon: RefreshCw,
  },
  {
    section: "Gestão",
    path: "/canhotos",
    label: "Canhotos",
    icon: FolderArchive,
  },
  {
    section: "Gestão",
    path: "/importar",
    label: "Importar",
    icon: FileDown,
  },
  {
    section: "Gestão",
    path: "/usuarios",
    label: "Usuários",
    icon: Users,
  },
];

const MENU_SECTIONS = ["Operação", "Gestão"];

/* =========================================================
   COMPONENTE
========================================================= */

export function Layout() {
  const { open, onToggle, onClose } = useDisclosure();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  /* =======================================================
     CARREGAR USUÁRIO
  ======================================================= */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Erro ao ler dados do usuário:", error);
    }
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =======================================================
     INICIAL DO USUÁRIO
  ======================================================= */

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Flex h="100vh" w="100%" overflow="hidden" bg={COLORS.background}>
      {/* ===================================================
          OVERLAY MOBILE
      =================================================== */}

      {open && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset={0}
          zIndex={49}
          bg="rgba(0, 0, 0, 0.55)"
          backdropFilter="blur(2px)"
          onClick={onClose}
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Box
        as="aside"
        position={{ base: "fixed", md: "relative" }}
        left={0}
        top={0}
        zIndex={50}
        w={{ base: "270px", md: "250px" }}
        h="100vh"
        flexShrink={0}
        display="flex"
        flexDirection="column"
        bg={COLORS.sidebar}
        color={COLORS.textSecondary}
        borderRight="1px solid"
        borderColor={COLORS.border}
        transform={{
          base: open ? "translateX(0)" : "translateX(-100%)",
          md: "translateX(0)",
        }}
        transition="transform 0.22s ease"
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <Flex
          h="72px"
          px="20px"
          align="center"
          gap="11px"
          flexShrink={0}
          borderBottom="1px solid"
          borderColor={COLORS.borderSoft}
        >
          <Flex
            w="34px"
            h="34px"
            align="center"
            justify="center"
            flexShrink={0}
            borderRadius="9px"
            bg={COLORS.blueSoft}
            color={COLORS.blue}
          >
            <PackageCheck size={19} strokeWidth={1.9} />
          </Flex>

          <Box lineHeight="1.1">
            <Text
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.04em"
              color={COLORS.textMuted}
              textTransform="uppercase"
            >
              Controle de
            </Text>

            <Text
              mt="3px"
              fontSize="15px"
              fontWeight="650"
              letterSpacing="-0.02em"
              color={COLORS.text}
            >
              Entregas
            </Text>
          </Box>
        </Flex>

        {/* =================================================
            NAVEGAÇÃO
        ================================================= */}

        <Box
          as="nav"
          flex="1"
          overflowY="auto"
          px="10px"
          py="18px"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },

            "&::-webkit-scrollbar-thumb": {
              background: COLORS.border,
              borderRadius: "10px",
            },
          }}
        >
          {MENU_SECTIONS.map((section) => {
            const items = MENU_ITEMS.filter((item) => item.section === section);

            return (
              <Box key={section} mb="22px">
                {/* Título da seção */}

                <Text
                  px="11px"
                  mb="7px"
                  fontSize="9px"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  color={COLORS.textMuted}
                >
                  {section}
                </Text>

                {/* Itens */}

                <VStack align="stretch" gap="2px">
                  {items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        {({ isActive }) => (
                          <Flex
                            position="relative"
                            align="center"
                            gap="11px"
                            w="100%"
                            px="11px"
                            py="10px"
                            borderRadius="9px"
                            bg={isActive ? COLORS.sidebarActive : "transparent"}
                            color={
                              isActive ? COLORS.text : COLORS.textSecondary
                            }
                            transition="all 0.18s ease"
                            cursor="pointer"
                            _hover={{
                              bg: COLORS.sidebarHover,
                              color: COLORS.text,
                            }}
                          >
                            {/* Indicador ativo */}

                            {isActive && (
                              <Box
                                position="absolute"
                                left={0}
                                top="7px"
                                bottom="7px"
                                w="2px"
                                borderRadius="0 4px 4px 0"
                                bg={COLORS.blue}
                              />
                            )}

                            {/* Ícone */}

                            <Flex
                              w="30px"
                              h="30px"
                              align="center"
                              justify="center"
                              flexShrink={0}
                              borderRadius="7px"
                              bg={isActive ? COLORS.blueSoft : "transparent"}
                              color={isActive ? COLORS.blue : COLORS.textMuted}
                              transition="all 0.18s ease"
                              className="menu-icon"
                              _groupHover={{
                                bg: COLORS.blueSoft,
                                color: COLORS.blue,
                              }}
                            >
                              <Icon
                                size={17}
                                strokeWidth={isActive ? 2 : 1.7}
                              />
                            </Flex>

                            {/* Nome */}

                            <Text
                              flex="1"
                              minW={0}
                              fontSize="13px"
                              fontWeight={isActive ? "600" : "500"}
                              color="inherit"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {item.label}
                            </Text>

                            {/* Seta */}

                            {isActive && (
                              <ChevronRight
                                size={14}
                                strokeWidth={1.7}
                                color={COLORS.textMuted}
                              />
                            )}
                          </Flex>
                        )}
                      </NavLink>
                    );
                  })}
                </VStack>
              </Box>
            );
          })}
        </Box>

        {/* =================================================
            USUÁRIO
        ================================================= */}

        <Box
          px="12px"
          py="12px"
          flexShrink={0}
          borderTop="1px solid"
          borderColor={COLORS.borderSoft}
        >
          <Flex
            align="center"
            gap="10px"
            p="9px"
            borderRadius="9px"
            bg={COLORS.sidebarHover}
            border="1px solid"
            borderColor={COLORS.borderSoft}
          >
            {/* Avatar */}

            <Flex
              w="32px"
              h="32px"
              align="center"
              justify="center"
              flexShrink={0}
              borderRadius="8px"
              bg={COLORS.blueAvatar}
              color="#60A5FA"
              fontSize="12px"
              fontWeight="700"
            >
              {userInitial}
            </Flex>

            {/* Informações */}

            <Box flex="1" minW={0} lineHeight="1.2">
              <Text
                fontSize="12px"
                fontWeight="600"
                color={COLORS.text}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {user?.name || "Usuário"}
              </Text>

              <Text
                mt="3px"
                fontSize="10px"
                color={COLORS.textMuted}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {user?.email || "operacao@empresa.com"}
              </Text>
            </Box>
          </Flex>

          {/* Logout */}

          <Box
            as="button"
            onClick={handleLogout}
            w="100%"
            mt="8px"
            py="8px"
            px="10px"
            borderRadius="8px"
            bg="transparent"
            border="1px solid transparent"
            color={COLORS.textMuted}
            fontSize="11px"
            fontWeight="600"
            cursor="pointer"
            transition="all 0.18s ease"
            _hover={{
              bg: COLORS.sidebarHover,
              borderColor: COLORS.border,
              color: COLORS.textSecondary,
            }}
          >
            <Flex align="center" justify="center" gap="7px">
              <LogOut size={14} strokeWidth={1.8} />

              <Text as="span">Sair da conta</Text>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* ===================================================
          ÁREA PRINCIPAL
      =================================================== */}

      <Flex
        flex="1"
        minW={0}
        direction="column"
        overflow="hidden"
        bg={COLORS.background}
      >
        {/* =================================================
            HEADER MOBILE
        ================================================= */}

        <Flex
          as="header"
          display={{
            base: "flex",
            md: "none",
          }}
          h="58px"
          flexShrink={0}
          align="center"
          px="12px"
          gap="10px"
          bg={COLORS.sidebar}
          borderBottom="1px solid"
          borderColor={COLORS.border}
          zIndex={20}
        >
          <IconButton
            aria-label="Abrir menu"
            onClick={onToggle}
            variant="ghost"
            size="sm"
            color={COLORS.textSecondary}
            _hover={{
              bg: COLORS.sidebarHover,
              color: COLORS.text,
            }}
          >
            <Menu size={19} />
          </IconButton>

          <Flex align="center" gap="8px">
            <Flex
              w="25px"
              h="25px"
              align="center"
              justify="center"
              borderRadius="7px"
              bg={COLORS.blueSoft}
              color={COLORS.blue}
            >
              <PackageCheck size={15} strokeWidth={1.9} />
            </Flex>

            <Text fontSize="13px" fontWeight="600" color={COLORS.text}>
              Controle de Entregas
            </Text>
          </Flex>
        </Flex>

        {/* =================================================
            CONTEÚDO
        ================================================= */}

        <Box as="main" flex="1" minH={0} overflowY="auto" overflowX="hidden">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
