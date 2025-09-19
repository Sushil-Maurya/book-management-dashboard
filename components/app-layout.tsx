"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
} from "@mui/material"
import {
  BookOutlined,
  PeopleOutlined,
  TrendingUpOutlined,
  HistoryOutlined,
  MenuOutlined,
  LightModeOutlined,
  DarkModeOutlined,
  SettingsBrightnessOutlined,
} from "@mui/icons-material"
import { useTheme } from "./theme-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BookOutlined },
  { name: "Members", href: "/members", icon: PeopleOutlined },
  { name: "Reports", href: "/reports", icon: TrendingUpOutlined },
  { name: "History", href: "/history", icon: HistoryOutlined },
]

const drawerWidth = 240

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const muiTheme = useMuiTheme()
  const { theme, setTheme } = useTheme()
  // Avoid SSR/client mismatch: evaluate media query on client only
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"), { noSsr: true })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <LightModeOutlined />
      case "dark":
        return <DarkModeOutlined />
      default:
        return <SettingsBrightnessOutlined />
    }
  }

  const getThemeTooltip = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode"
      case "dark":
        return "Switch to system mode"
      default:
        return "Switch to light mode"
    }
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BookOutlined color="primary" />
          <Typography variant="h6" noWrap component="div" color="primary">
            BookManager
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: muiTheme.palette.primary.main,
                    color: muiTheme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: muiTheme.palette.primary.dark,
                    },
                    "& .MuiListItemIcon-root": {
                      color: muiTheme.palette.primary.contrastText,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Box sx={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
        <Tooltip title={getThemeTooltip()}>
          <IconButton
            onClick={handleThemeToggle}
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: muiTheme.palette.action.hover,
              },
            }}
          >
            {getThemeIcon()}
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {theme} mode
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          display: { md: "none" },
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuOutlined />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BookManager
          </Typography>
          <Tooltip title={getThemeTooltip()}>
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {getThemeIcon()}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
