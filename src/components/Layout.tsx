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
   CONFIGURAÇÕES VISUAIS
========================================================= */

const COLORS = {
  background: "#0F1115",
  sidebar: "#111318",
  sidebarHover: "#1A1D24",

  border: "#252932",
  borderHover: "#353B47",

  text: "#F1F5F9",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.12)",
  blueAvatar: "rgba(59, 130, 246, 0.14)",
};

/* =========================================================
   MENU
========================================================= */

const MENU_ITEMS = [
  {
    path: "/buscar",
    label: "Buscar NF",
    sub: "Operação do dia",
    icon: Search,
  },
  {
    path: "/ocorrencias",
    label: "Ocorrências",
    sub: "Painel e registros",
    icon: ClipboardList,
  },
  {
    path: "/retencao",
    label: "Retenção",
    sub: "Veículo parado",
    icon: Truck,
  },
  {
    path: "/importar",
    label: "Importar",
    sub: "Base do dia (.xlsx)",
    icon: FileDown,
  },
  {
    path: "/usuarios",
    label: "Usuários",
    sub: "Gerenciar usuários",
    icon: Users,
  },
];

/* =========================================================
   ESTILO DOS LINKS
========================================================= */

const NAV_LINK_STYLE = ({
  isActive,
}: {
  isActive: boolean;
}): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "11px 12px",
  borderRadius: "8px",
  textDecoration: "none",

  backgroundColor: isActive ? COLORS.blueSoft : "transparent",

  color: isActive ? COLORS.text : COLORS.textSecondary,

  boxShadow: isActive ? `inset 2px 0 0 ${COLORS.blue}` : "none",

  transition:
    "background-color 0.18s ease, color 0.18s ease, transform 0.18s ease",
});

/* =========================================================
   COMPONENTE
========================================================= */

export function Layout() {
  const { open, onToggle, onClose } = useDisclosure();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  /* =======================================================
     CARREGA USUÁRIO
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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

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
    <>
      {/* ===================================================
          ESTILOS DO MENU
      =================================================== */}

      <style>
        {`
          .sidebar-nav-item {
            transition:
              background-color 0.18s ease,
              color 0.18s ease,
              transform 0.18s ease;
          }

          .sidebar-nav-item:hover {
            background-color: ${COLORS.sidebarHover} !important;
            color: ${COLORS.text} !important;
            transform: translateX(2px);
          }
        `}
      </style>

      <Flex h="100vh" overflow="hidden" bg={COLORS.background}>
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Box
          as="aside"
          w="262px"
          h="100vh"
          bg={COLORS.sidebar}
          color={COLORS.textSecondary}
          position="sticky"
          top={0}
          display={{
            base: open ? "flex" : "none",
            md: "flex",
          }}
          flexDirection="column"
          borderRight="1px solid"
          borderColor={COLORS.border}
          zIndex={60}
          css={{
            "@media (max-width: 900px)": {
              position: "fixed",
              left: 0,
              top: 0,
              transform: open ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.22s ease",
            },
          }}
        >
          {/* ===============================================
              LOGO
          =============================================== */}

          <Flex p="22px 22px 18px" align="center" gap="10px">
            <Box
              w="30px"
              h="30px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={COLORS.blue}
              flex="0 0 auto"
            >
              <PackageCheck size={26} strokeWidth={1.7} />
            </Box>

            <Box>
              <Text
                fontSize="12.5px"
                fontWeight="600"
                letterSpacing="0.02em"
                lineHeight="1.15"
                color={COLORS.textSecondary}
              >
                Controle de
              </Text>

              <Text
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.01em"
                lineHeight="1.2"
                color={COLORS.text}
              >
                Entregas
              </Text>
            </Box>
          </Flex>

          {/* ===============================================
              NAVEGAÇÃO
          =============================================== */}

          <VStack as="nav" align="stretch" gap="2px" px="12px" py="6px">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="sidebar-nav-item"
                  style={NAV_LINK_STYLE}
                >
                  {/* Ícone */}

                  <Box
                    w="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flex="0 0 auto"
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </Box>

                  {/* Texto */}

                  <Box lineHeight="1.25" minW={0}>
                    <Text fontSize="14px" fontWeight="600" color="inherit">
                      {item.label}
                    </Text>

                    <Text fontSize="11px" color="inherit" opacity={0.65}>
                      {item.sub}
                    </Text>
                  </Box>
                </NavLink>
              );
            })}
          </VStack>

          {/* ===============================================
              USUÁRIO
          =============================================== */}

          <Box
            mt="auto"
            p="16px"
            borderTop="1px solid"
            borderColor={COLORS.border}
          >
            <Flex align="center" gap="11px" mb="12px">
              {/* Avatar */}

              <Flex
                w="34px"
                h="34px"
                align="center"
                justify="center"
                borderRadius="9px"
                bg={COLORS.blueAvatar}
                color="#60A5FA"
                fontWeight="700"
                fontSize="14px"
                flex="0 0 auto"
              >
                {userInitial}
              </Flex>

              {/* Informações */}

              <Box minW={0} lineHeight="1.25">
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color={COLORS.text}
                  truncate
                >
                  {user?.name || "Usuário"}
                </Text>

                <Text fontSize="11px" color={COLORS.textMuted} truncate>
                  {user?.email || "operacao@empresa.com"}
                </Text>
              </Box>
            </Flex>

            {/* =============================================
                LOGOUT
            ============================================= */}

            <Box
              as="button"
              onClick={handleLogout}
              w="100%"
              py="8px"
              px="12px"
              borderRadius="8px"
              bg="transparent"
              border="1px solid"
              borderColor={COLORS.borderHover}
              color={COLORS.textSecondary}
              fontSize="12.5px"
              fontWeight="600"
              cursor="pointer"
              transition="all 0.18s ease"
              _hover={{
                bg: COLORS.sidebarHover,
                borderColor: "#4B5563",
                color: COLORS.text,
              }}
            >
              <Flex align="center" justify="center" gap="8px">
                <LogOut size={16} strokeWidth={1.8} />

                <Text as="span">Sair da conta</Text>
              </Flex>
            </Box>
          </Box>
        </Box>

        {/* =================================================
            CONTEÚDO PRINCIPAL
        ================================================= */}

        <Flex
          flex="1"
          direction="column"
          overflowY="auto"
          minW={0}
          bg={COLORS.background}
        >
          {/* ===============================================
              HEADER MOBILE
          =============================================== */}

          <Flex
            as="header"
            display={{
              base: "flex",
              md: "none",
            }}
            align="center"
            gap="12px"
            p="10px 14px"
            bg={COLORS.sidebar}
            borderBottom="1px solid"
            borderColor={COLORS.border}
            position="sticky"
            top={0}
            zIndex={20}
          >
            <IconButton
              aria-label="Abrir menu"
              onClick={onToggle}
              variant="ghost"
              color={COLORS.textSecondary}
              _hover={{
                bg: COLORS.sidebarHover,
                color: COLORS.text,
              }}
            >
              <Menu size={20} />
            </IconButton>

            <Text fontWeight="600" color={COLORS.text}>
              Controle de Entregas
            </Text>
          </Flex>

          {/* ===============================================
              PÁGINA
          =============================================== */}

          <Box as="main" flex="1">
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </>
  );
}
