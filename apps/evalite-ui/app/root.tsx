import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import {
  ChevronDownCircleIcon,
  ChevronRightCircleIcon,
  ChevronUpCircleIcon,
  LoaderCircleIcon,
  ZapIcon,
} from "lucide-react";
import { SidebarRight } from "~/components/sidebar-right";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar";

import { getEvals } from "@evalite/core/sdk";
import "./tailwind.css";
import {
  TestServerStateContext,
  useSubscribeToTestServer,
} from "./use-subscribe-to-socket";
import { getScoreState, Score, type ScoreState } from "./components/score";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const clientLoader = async () => {
  const evals = await getEvals();

  return {
    menu: Object.entries(evals).map(([key, value]) => {
      const mostRecentEval = value[0]!;

      const secondMostRecentEval = value[1];

      const score = mostRecentEval.score;

      const state = getScoreState(score, secondMostRecentEval?.score);
      return {
        name: key,
        state,
        score,
        filepath: mostRecentEval.filepath,
      };
    }),
  };
};

export default function App() {
  const evals = useLoaderData<typeof clientLoader>();

  const testServer = useSubscribeToTestServer();

  return (
    <TestServerStateContext.Provider value={testServer}>
      <SidebarProvider>
        <Sidebar className="border-r-0">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-2 py-1 flex items-center space-x-2.5">
                  <ZapIcon className="size-4" />
                  <span className="truncate font-semibold tracking-tight">
                    Evalite
                  </span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Evals</SidebarGroupLabel>
              <SidebarMenu>
                {evals.menu.map((item) => {
                  let isRunning = false;

                  if (testServer.state.type === "running") {
                    isRunning = testServer.state.filepaths.has(item.filepath);
                  }
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={`/eval/${item.name}`}
                          className="flex justify-between"
                        >
                          <span>{item.name}</span>

                          <Score
                            score={item.score}
                            state={item.state}
                            isRunning={isRunning}
                          />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <Outlet />
      </SidebarProvider>
    </TestServerStateContext.Provider>
  );
}
