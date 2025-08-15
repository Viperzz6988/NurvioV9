import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LeaderboardProvider } from "./contexts/LeaderboardContext";
import HomePage from "./pages/HomePage";
// import KontaktPage from "./pages/KontaktPage";
import SpielelobbyPage from "./pages/SpielelobbyPage";
import ZufallsgeneratorPage from "./pages/ZufallsgeneratorPage";
import GlueckradPage from "./pages/GlueckradPage";
import TetrisPage from "./pages/TetrisPage";
import SnakePage from "./pages/SnakePage";
import TicTacToePage from "./pages/TicTacToePage";
// import GamblePage from "./pages/games/GamblePage";
import GambleLobbyPage from "./pages/gamble/GambleLobbyPage";
import RiskPlayPage from "./pages/gamble/RiskPlayPage";
import HighRiskClickerPage from "./pages/gamble/HighRiskClickerPage";
import BlackjackPage from "./pages/gamble/BlackjackPage";
import CoinFlipPage from "./pages/random/CoinFlipPage";
import RandomNumberPage from "./pages/random/RandomNumberPage";
import WeatherPage from "./pages/WeatherPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/admin/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <LeaderboardProvider>
                <Layout>
                  <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* Spiele (Games) */}
                  <Route path="/spiele/lobby" element={<SpielelobbyPage />} />
                  <Route path="/spiele/tetris" element={<TetrisPage />} />
                  <Route path="/spiele/snake" element={<SnakePage />} />
                  {/* Removed legacy Gamble Game page from Games */}
                  <Route path="/spiele/tictactoe" element={<TicTacToePage />} />
                  {/* Gamble */}
                  <Route path="/gamble" element={<GambleLobbyPage />} />
                  <Route path="/gamble/lobby" element={<GambleLobbyPage />} />
                  <Route path="/gamble/riskplay" element={<RiskPlayPage />} />
                  <Route path="/gamble/high-risk-clicker" element={<HighRiskClickerPage />} />
                  <Route path="/gamble/blackjack" element={<BlackjackPage />} />
                  {/* Zufall (Random) */}
                  <Route path="/zufall/muenzwurf" element={<CoinFlipPage />} />
                  <Route path="/zufall/zahl" element={<RandomNumberPage />} />
                  <Route path="/zufall/gluecksrad" element={<GlueckradPage />} />
                  {/* Wetter (Weather) */}
                  <Route path="/wetter" element={<WeatherPage />} />
                  {/* Kontakt (Contact) */}
                  <Route path="/kontakt" element={<ContactPage />} />
                  {/* Admin */}
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </LeaderboardProvider>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
