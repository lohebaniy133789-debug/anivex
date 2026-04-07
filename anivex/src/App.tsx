import { Route, Switch } from "wouter"
import { SignIn, SignUp } from "@clerk/react"
import AnivexPlatform from "@/pages/AnivexPlatform"

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "")

export default function App() {
  return (
    <Switch>
      <Route path={`${basePath}/sign-in`}>
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
          <SignIn routing="path" path={`${basePath}/sign-in`} afterSignInUrl={basePath || "/"} />
        </div>
      </Route>
      <Route path={`${basePath}/sign-up`}>
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
          <SignUp routing="path" path={`${basePath}/sign-up`} afterSignUpUrl={basePath || "/"} />
        </div>
      </Route>
      <Route>
        <AnivexPlatform />
      </Route>
    </Switch>
  )
}
