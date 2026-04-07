import { Route, Switch } from "wouter"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import Layout from "@/components/layout/Layout"
import HomePage from "@/pages/HomePage"
import CatalogPage from "@/pages/CatalogPage"
import AnimePage from "@/pages/AnimePage"
import ProfilePage from "@/pages/ProfilePage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="anivex-theme">
      <TooltipProvider>
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/catalog" component={CatalogPage} />
            <Route path="/anime/:id" component={AnimePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Layout>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
