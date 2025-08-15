export interface TranslationKeys {
  // Menus (no nav.* prefix)
  'home.menu': string;
  'random.menu': string;
  'lobby': string;
  
  // Home page
  'home.welcome': string;
  'home.subtitle': string;
  'home.description': string;
  'home.explore': string;
  'home.games': string;
  'home.random': string;
  'home.weather': string;
  
  // Games generic
  'games.title': string;
  'games.description': string;
  'games.play': string;
  'games.highscore': string;
  'games.score': string;
  'games.level': string;
  'games.gameOver': string;
  'games.restart': string;
  'games.pause': string;
  'games.resume': string;
  'games.nextLevel': string;

  // Game specific
  'games.tetris.title': string;
  'games.tetris.description': string;
  'games.snake.title': string;
  'games.snake.description': string;
  'games.tictactoe.title': string;
  'games.tictactoe.description': string;

  // Features list used in lobby cards
  'games.features.levels': string;
  'games.features.highscore': string;
  'games.features.pause': string;
  'games.features.difficultyScaling': string;
  'games.features.powerups': string;
  'games.features.maps': string;
  'games.features.localMultiplayer': string;
  'games.features.ai': string;
  'games.features.stats': string;

  // Lobby
  'games.lobby.title': string;
  'games.lobby.subtitle': string;
  'games.all': string;
  'games.details.features': string;
  'games.details.difficulty.label': string;
  'games.details.players.label': string;
  'games.details.duration.label': string;
  'games.details.duration.minutes': string;
  'games.details.difficulty.easy': string;
  'games.details.difficulty.medium': string;
  'games.details.difficulty.hard': string;
  'games.details.players.single': string;
  'games.details.players.two': string;
  
  // Weather
  'weather.title': string;
  'weather.description': string;
  'weather.search': string;
  'weather.searchButton': string;
  'weather.loading': string;
  'weather.error': string;
  'weather.currentWeather': string;
  'weather.feelsLike': string;
  'weather.humidity': string;
  'weather.windSpeed': string;
  'weather.visibility': string;
  'weather.pressure': string;
  'weather.uvIndex': string;
  'weather.forecast': string;
  'weather.tips': string;
  'weather.getStarted': string;
  'weather.popularCities': string;
  
  // Contact
  'contact.title': string;
  'contact.description': string;
  'contact.name': string;
  'contact.email': string;
  'contact.message': string;
  'contact.send': string;
  'contact.success': string;
  'contact.error': string;

  // Auth
  'auth.login': string;
  'auth.signup': string;
  'auth.loginSubtitle': string;
  'auth.signupSubtitle': string;
  'auth.email': string;
  'auth.password': string;
  'auth.name': string;
  'auth.submitLogin': string;
  'auth.submitSignup': string;
  'auth.validation.email': string;
  'auth.validation.password': string;
  'auth.validation.name': string;
  'auth.placeholder.name': string;
  'auth.placeholder.email': string;
  'auth.placeholder.password': string;
  'auth.welcome': string;
  'auth.chooseMethod': string;
  'auth.continueAsGuest': string;
  'auth.guest': string;
  
  // Random tools
  'random.coinflip.title': string;
  'random.coinflip.flip': string;
  'random.coinflip.heads': string;
  'random.coinflip.tails': string;
  'random.coinflip.result': string;
  'random.coinflip.description': string;
  'random.coinflip.flipping': string;
  'random.coinflip.stats': string;
  'random.coinflip.historyTitle': string;
  'random.coinflip.total': string;
  'random.coinflip.headRate': string;
  'random.coinflip.headsLabel': string;
  'random.coinflip.tailsLabel': string;
  'random.coinflip.recentFlips': string;
  'random.coinflip.none': string;
  
  'random.wheel.title': string;
  'random.wheel.description': string;
  'random.wheel.spin': string;
  'random.wheel.spinning': string;
  'random.wheel.add': string;
  'random.wheel.addPlaceholder': string;
  'random.wheel.currentOptions': string;
  'random.wheel.reset': string;
  'random.wheel.result': string;
  'random.wheel.tooFewOptions': string;
  'random.wheel.minOptions': string;
  'random.wheel.optionsCount': string;
  'random.wheel.instructions': string;
  
  'random.number.title': string;
  'random.number.description': string;
  'random.number.generate': string;
  'random.number.min': string;
  'random.number.max': string;
  'random.number.result': string;
  'random.number.generating': string;
  'random.number.rangeTitle': string;
  'random.number.rangeSubtitle': string;
  'random.number.invalidRange': string;
  'random.number.possible': string;
  'random.number.presets': string;
  'random.number.historyTitle': string;
  'random.number.historySubtitle': string;
  'random.number.historyEmpty': string;
  'random.number.statsTitle': string;
  
  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.remove': string;
  'common.reset': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.close': string;
  'common.open': string;
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.darkMode': string;
  'common.lightMode': string;
  
  // Weather conditions
  'weather.conditions.sunny': string;
  'weather.conditions.cloudy': string;
  'weather.conditions.rainy': string;
  'weather.conditions.snowy': string;
  'weather.conditions.stormy': string;
  'weather.conditions.foggy': string;
  'weather.conditions.partlyCloudy': string;
  
  // Weather tips
  'weather.tips.cold': string;
  'weather.tips.hot': string;
  'weather.tips.rainy': string;
  'weather.tips.windy': string;
  'weather.tips.perfect': string;

  // Gamble section
  'gamble.landing.title': string;
  'gamble.landing.subtitle': string;
  // Removed nav.* keys; use game titles

  // Animations common
  'animations.lose': string;

  // RiskPlay
  'riskplay.title': string;
  'riskplay.subtitle': string;
  'riskplay.balance': string;
  'riskplay.reset': string;
  'riskplay.bet': string;
  'riskplay.quickBets.max': string;
  'riskplay.betChanceTitle': string;
  'riskplay.betChanceDescription': string;
  'riskplay.winChance': string;
  'riskplay.multiplier': string;
  'riskplay.potentialWin': string;
  'riskplay.play': string;
  'riskplay.playing': string;
  'riskplay.note.title': string;
  'riskplay.note.text': string;
  'riskplay.leaderboardSaved': string;

  // High Risk Clicker
  'hrc.title': string;
  'hrc.subtitle': string;
  'hrc.clicks': string;
  'hrc.loseChance': string;
  'hrc.click': string;
  'hrc.gameOver': string;
  'hrc.score': string;
  'hrc.retry': string;

  // Blackjack page
  'blackjack.title': string;
  'blackjack.subtitle': string;
  'blackjack.cta.newRound': string;
  'blackjack.cta.hit': string;
  'blackjack.cta.stand': string;
  'blackjack.msg.playerBust': string;
  'blackjack.msg.dealerBust': string;
  'blackjack.msg.playerWin': string;
  'blackjack.msg.dealerWin': string;
  'blackjack.msg.push': string;
  'blackjack.dealer': string;
  'blackjack.player': string;
  'blackjack.hiddenCard': string;
  'blackjack.total': string;
  // Added keys for enhanced Blackjack UI
  'blackjack.balance': string;
  'blackjack.currentBet': string;
  'blackjack.clearBet': string;
  'blackjack.placeBetAndDeal': string;
  'blackjack.cta.double': string;
  'blackjack.cta.split': string;

  // Leaderboards
  'leaderboard.title': string;
  'leaderboard.empty': string;

  // Additional animations
  'animations.won': string;
}

export const translations: Record<'de' | 'en', TranslationKeys> = {
  de: {
    // Menus
    'home.menu': 'Startseite',
    'random.menu': 'Zufall',
    'lobby': 'Lobby',
    
    // Home page
    'home.welcome': 'Willkommen auf Nurvio-Hub',
    'home.subtitle': 'Moderne Webanwendungen von Jeevan & Moritz',
    'home.description': 'Diese Webseite wurde gemeinsam von Jeevan und Moritz als Referenzprojekt entwickelt. Entdecke unsere Sammlung von Spielen, Tools und interaktiven Anwendungen.',
    'home.explore': 'Jetzt entdecken',
    'home.games': 'Spiele',
    'home.random': 'Zufall',
    'home.weather': 'Wetter',
    
    // Games generic
    'games.title': 'Spiele',
    'games.description': 'Entdecke unsere Sammlung klassischer Spiele',
    'games.play': 'Spielen',
    'games.highscore': 'Highscore',
    'games.score': 'Punkte',
    'games.level': 'Level',
    'games.gameOver': 'Game Over',
    'games.restart': 'Neu starten',
    'games.pause': 'Pause',
    'games.resume': 'Fortsetzen',
    'games.nextLevel': 'Nächstes Level',

    'games.tetris.title': 'Tetris',
    'games.tetris.description': 'Der Klassiker - stapele die Blöcke und räume Linien ab!',
    'games.snake.title': 'Snake',
    'games.snake.description': 'Sammle Punkte und werde länger - aber vermeide Kollisionen!',
    'games.tictactoe.title': 'Tic Tac Toe',
    'games.tictactoe.description': 'Drei in einer Reihe - gegen Freunde oder die KI!',

    // Features list used in lobby cards
    'games.features.levels': 'Verschiedene Level',
    'games.features.highscore': 'High Score',
    'games.features.pause': 'Pause-Funktion',
    'games.features.difficultyScaling': 'Wachsende Schwierigkeit',
    'games.features.powerups': 'Power-Ups',
    'games.features.maps': 'Verschiedene Maps',
    'games.features.localMultiplayer': 'Lokaler Multiplayer',
    'games.features.ai': 'KI-Gegner',
    'games.features.stats': 'Statistiken',

    // Lobby
    'games.lobby.title': 'Spiele-Lobby',
    'games.lobby.subtitle': 'Entdecke unsere Sammlung klassischer Spiele in modernem Design. Alle Spiele funktionieren perfekt auf jedem Gerät.',
    'games.all': 'Alle Spiele',
    'games.details.features': 'Features:',
    'games.details.difficulty.label': 'Schwierigkeit',
    'games.details.players.label': 'Spieler',
    'games.details.duration.label': 'Dauer',
    'games.details.duration.minutes': 'Min',
    'games.details.difficulty.easy': 'Einfach',
    'games.details.difficulty.medium': 'Mittel',
    'games.details.difficulty.hard': 'Schwer',
    'games.details.players.single': 'Einzelspieler',
    'games.details.players.two': '2 Spieler',
    
    // Weather
    'weather.title': 'Wetter',
    'weather.description': 'Aktuelle Wetterdaten für deinen Standort',
    'weather.search': 'Stadt eingeben...',
    'weather.searchButton': 'Wetter abrufen',
    'weather.loading': 'Lädt...',
    'weather.error': 'Fehler beim Laden der Wetterdaten',
    'weather.currentWeather': 'Aktuelle Wetterlage',
    'weather.feelsLike': 'Gefühlt wie',
    'weather.humidity': 'Luftfeuchtigkeit',
    'weather.windSpeed': 'Windgeschwindigkeit',
    'weather.visibility': 'Sichtweite',
    'weather.pressure': 'Luftdruck',
    'weather.uvIndex': 'UV-Index',
    'weather.forecast': '7-Tage Vorhersage',
    'weather.tips': 'Wetter-Tipps',
    'weather.getStarted': 'Wetter abrufen',
    'weather.popularCities': 'Beliebte Städte',
    
    // Contact
    'contact.title': 'Kontakt',
    'contact.description': 'Du möchtest uns kontaktieren? Schreib uns einfach!',
    'contact.name': 'Name',
    'contact.email': 'E-Mail',
    'contact.message': 'Nachricht',
    'contact.send': 'Senden',
    'contact.success': 'Nachricht erfolgreich gesendet!',
    'contact.error': 'Fehler beim Senden der Nachricht',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Registrieren',
    'auth.loginSubtitle': 'Melde dich mit deiner E-Mail an',
    'auth.signupSubtitle': 'Erstelle ein neues Konto',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.name': 'Name',
    'auth.submitLogin': 'Einloggen',
    'auth.submitSignup': 'Registrieren',
    'auth.validation.email': 'Bitte eine gültige E-Mail eingeben',
    'auth.validation.password': 'Das Passwort muss mindestens 6 Zeichen lang sein',
    'auth.validation.name': 'Der Name muss mindestens 2 Zeichen lang sein',
    'auth.placeholder.name': 'Dein Name',
    'auth.placeholder.email': 'deine@email.com',
    'auth.placeholder.password': 'Passwort',
    'auth.welcome': 'Willkommen',
    'auth.chooseMethod': 'Wähle eine Methode, um fortzufahren',
    'auth.continueAsGuest': 'Als Gast fortfahren',
    'auth.guest': 'Gast',
    
    // Random tools
    'random.coinflip.title': 'Münzwurf',
    'random.coinflip.flip': 'Münze werfen',
    'random.coinflip.heads': 'Kopf',
    'random.coinflip.tails': 'Zahl',
    'random.coinflip.result': 'Ergebnis',
    'random.coinflip.description': 'Klassische Entscheidungshilfe - Kopf oder Zahl?',
    'random.coinflip.flipping': 'Münze fliegt...',
    'random.coinflip.stats': 'Statistiken',
    'random.coinflip.historyTitle': 'Deine Wurf-Historie',
    'random.coinflip.total': 'Gesamt',
    'random.coinflip.headRate': 'Kopf Rate',
    'random.coinflip.headsLabel': 'Kopf',
    'random.coinflip.tailsLabel': 'Zahl',
    'random.coinflip.recentFlips': 'Letzte Würfe',
    'random.coinflip.none': 'Noch keine Würfe',
    
    'random.wheel.title': 'Glücksrad',
    'random.wheel.description': 'Lass das Glücksrad entscheiden! Füge deine eigenen Optionen hinzu und drehe das Rad.',
    'random.wheel.spin': 'Drehen!',
    'random.wheel.spinning': 'Dreht...',
    'random.wheel.add': 'Option hinzufügen',
    'random.wheel.addPlaceholder': 'Neue Option...',
    'random.wheel.currentOptions': 'Aktuelle Optionen',
    'random.wheel.reset': 'Reset',
    'random.wheel.result': 'Ergebnis:',
    'random.wheel.tooFewOptions': 'Du benötigst mindestens 2 Optionen zum Drehen.',
    'random.wheel.minOptions': 'Du benötigst mindestens 2 Optionen.',
    'random.wheel.optionsCount': 'Optionen',
    'random.wheel.instructions': 'Klicke auf "Drehen" um das Rad zu starten',
    
    'random.number.title': 'Zufallszahl',
    'random.number.description': 'Generiere eine zufällige Zahl zwischen deinen gewählten Werten.',
    'random.number.generate': 'Generieren',
    'random.number.min': 'Minimum',
    'random.number.max': 'Maximum',
    'random.number.result': 'Zufallszahl',
    'random.number.generating': 'Generiere...',
    'random.number.rangeTitle': 'Zahlenbereich',
    'random.number.rangeSubtitle': 'Stelle deinen gewünschten Bereich ein',
    'random.number.invalidRange': 'Ungültiger Bereich! Minimum muss kleiner als Maximum sein.',
    'random.number.possible': 'Mögliche Zahlen',
    'random.number.presets': 'Schnellauswahl:',
    'random.number.historyTitle': 'Verlauf',
    'random.number.historySubtitle': 'Letzte 10 Zahlen',
    'random.number.historyEmpty': 'Noch keine Zahlen generiert',
    'random.number.statsTitle': 'Statistiken',
    
    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolgreich',
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.add': 'Hinzufügen',
    'common.remove': 'Entfernen',
    'common.reset': 'Zurücksetzen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Zurück',
    'common.close': 'Schließen',
    'common.open': 'Öffnen',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.ok': 'OK',
    'common.darkMode': 'Dunkelmodus',
    'common.lightMode': 'Hellmodus',
    
    // Weather conditions
    'weather.conditions.sunny': 'Sonnig',
    'weather.conditions.cloudy': 'Bewölkt',
    'weather.conditions.rainy': 'Regnerisch',
    'weather.conditions.snowy': 'Schneeschauer',
    'weather.conditions.stormy': 'Gewitter',
    'weather.conditions.foggy': 'Neblig',
    'weather.conditions.partlyCloudy': 'Teilweise bewölkt',
    
    // Weather tips
    'weather.tips.cold': '❄️ Vorsicht vor Glätte!',
    'weather.tips.hot': '☀️ Sonnenschutz nicht vergessen!',
    'weather.tips.rainy': '🌧️ Regenschirm mitnehmen!',
    'weather.tips.windy': '💨 Starker Wind - gut zum Drachensteigen!',
    'weather.tips.perfect': '🌡️ Perfektes Wetter für einen Spaziergang!',

    // Gamble section
    'gamble.landing.title': 'Gamble',
    'gamble.landing.subtitle': 'Lobby mit Leaderboard und Links zu Spielen',

    // Animations common
    'animations.lose': 'Verloren!',

    // RiskPlay
    'riskplay.title': 'RiskPlay',
    'riskplay.subtitle': 'Wähle deinen Einsatz, setze und gewinne mit Risiko.',
    'riskplay.balance': 'Guthaben',
    'riskplay.reset': 'Reset',
    'riskplay.bet': 'Einsatz',
    'riskplay.quickBets.max': 'Max',
    'riskplay.betChanceTitle': 'Einsatz & Gewinnchance',
    'riskplay.betChanceDescription': 'Quick bet buttons and maximum bet',
    'riskplay.winChance': 'Gewinnchance',
    'riskplay.multiplier': 'Multiplikator',
    'riskplay.potentialWin': 'Möglicher Gewinn',
    'riskplay.play': 'Setzen',
    'riskplay.playing': 'Spielt...',
    'riskplay.note.title': 'Hinweis',
    'riskplay.note.text': 'Spiele verantwortungsbewusst. Setze nur, was du bereit bist zu verlieren.',
    'riskplay.leaderboardSaved': 'Gewinne werden im Leaderboard gespeichert.',

    // High Risk Clicker
    'hrc.title': 'High Risk Clicker',
    'hrc.subtitle': 'Jeder Klick erhöht die Verlustwahrscheinlichkeit um 1%.',
    'hrc.clicks': 'Klicks',
    'hrc.loseChance': 'Verlustchance',
    'hrc.click': 'CLICK',
    'hrc.gameOver': 'Game Over',
    'hrc.score': 'Score',
    'hrc.retry': 'Erneut',

    // Blackjack page
    'blackjack.title': 'Blackjack',
    'blackjack.subtitle': 'Spiele gegen den Dealer. Hit bei <17, sonst Stand.',
    'blackjack.cta.newRound': 'Neue Runde',
    'blackjack.cta.hit': 'Hit',
    'blackjack.cta.stand': 'Stand',
    'blackjack.msg.playerBust': 'Bust! Dealer gewinnt.',
    'blackjack.msg.dealerBust': 'Dealer bust! Du gewinnst.',
    'blackjack.msg.playerWin': 'Du gewinnst!',
    'blackjack.msg.dealerWin': 'Dealer gewinnt!',
    'blackjack.msg.push': 'Unentschieden!',
    'blackjack.dealer': 'Dealer',
    'blackjack.player': 'Spieler',
    'blackjack.hiddenCard': 'Eine Karte verdeckt',
    'blackjack.total': 'Gesamtpunkte',
    // Added keys for enhanced Blackjack UI
    'blackjack.balance': 'Guthaben',
    'blackjack.currentBet': 'Aktueller Einsatz',
    'blackjack.clearBet': 'Einsatz löschen',
    'blackjack.placeBetAndDeal': 'Einsatz setzen & geben',
    'blackjack.cta.double': 'Doppeln',
    'blackjack.cta.split': 'Splitten',

    // Leaderboards
    'leaderboard.title': 'Leaderboards',
    'leaderboard.empty': 'Noch keine Einträge',

    // Additional animations
    'animations.won': 'Gewonnen',
  },
  en: {
    // Menus
    'home.menu': 'Home',
    'random.menu': 'Random',
    'lobby': 'Lobby',
    
    // Home page
    'home.welcome': 'Welcome to Nurvio-Hub',
    'home.subtitle': 'Modern Web Applications by Jeevan & Moritz',
    'home.description': 'This website was developed jointly by Jeevan and Moritz as a reference project. Discover our collection of games, tools and interactive applications.',
    'home.explore': 'Explore Now',
    'home.games': 'Games',
    'home.random': 'Random',
    'home.weather': 'Weather',
    
    // Games generic
    'games.title': 'Games',
    'games.description': 'Discover our collection of classic games',
    'games.play': 'Play',
    'games.highscore': 'Highscore',
    'games.score': 'Score',
    'games.level': 'Level',
    'games.gameOver': 'Game Over',
    'games.restart': 'Restart',
    'games.pause': 'Pause',
    'games.resume': 'Resume',
    'games.nextLevel': 'Next Level',

    'games.tetris.title': 'Tetris',
    'games.tetris.description': 'The classic - stack the blocks and clear lines!',
    'games.snake.title': 'Snake',
    'games.snake.description': 'Collect points and grow longer - but avoid collisions!',
    'games.tictactoe.title': 'Tic Tac Toe',
    'games.tictactoe.description': 'Three in a row - against friends or the AI!',

    // Features list used in lobby cards
    'games.features.levels': 'Multiple Levels',
    'games.features.highscore': 'High Score',
    'games.features.pause': 'Pause Feature',
    'games.features.difficultyScaling': 'Increasing Difficulty',
    'games.features.powerups': 'Power-ups',
    'games.features.maps': 'Various Maps',
    'games.features.localMultiplayer': 'Local Multiplayer',
    'games.features.ai': 'AI Opponent',
    'games.features.stats': 'Statistics',

    // Lobby
    'games.lobby.title': 'Games Lobby',
    'games.lobby.subtitle': 'Discover our collection of classic games in a modern design. All games work perfectly on every device.',
    'games.all': 'All Games',
    'games.details.features': 'Features:',
    'games.details.difficulty.label': 'Difficulty',
    'games.details.players.label': 'Players',
    'games.details.duration.label': 'Duration',
    'games.details.duration.minutes': 'min',
    'games.details.difficulty.easy': 'Easy',
    'games.details.difficulty.medium': 'Medium',
    'games.details.difficulty.hard': 'Hard',
    'games.details.players.single': 'Singleplayer',
    'games.details.players.two': '2 Players',
    
    // Weather
    'weather.title': 'Weather',
    'weather.description': 'Current weather data for your location',
    'weather.search': 'Enter city...',
    'weather.searchButton': 'Get Weather',
    'weather.loading': 'Loading...',
    'weather.error': 'Error loading weather data',
    'weather.currentWeather': 'Current Weather',
    'weather.feelsLike': 'Feels Like',
    'weather.humidity': 'Humidity',
    'weather.windSpeed': 'Wind Speed',
    'weather.visibility': 'Visibility',
    'weather.pressure': 'Pressure',
    'weather.uvIndex': 'UV Index',
    'weather.forecast': '7-Day Forecast',
    'weather.tips': 'Weather Tips',
    'weather.getStarted': 'Get Weather',
    'weather.popularCities': 'Popular Cities',
    
    // Contact
    'contact.title': 'Contact',
    'contact.description': 'Want to contact us? Just write to us!',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.success': 'Message sent successfully!',
    'contact.error': 'Error sending message',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.loginSubtitle': 'Sign in with your email',
    'auth.signupSubtitle': 'Create a new account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.submitLogin': 'Log In',
    'auth.submitSignup': 'Register',
    'auth.validation.email': 'Please enter a valid email',
    'auth.validation.password': 'Password must be at least 6 characters',
    'auth.validation.name': 'Name must be at least 2 characters',
    'auth.placeholder.name': 'Your name',
    'auth.placeholder.email': 'your@email.com',
    'auth.placeholder.password': 'Password',
    'auth.welcome': 'Welcome',
    'auth.chooseMethod': 'Choose a method to continue',
    'auth.continueAsGuest': 'Continue as guest',
    'auth.guest': 'Guest',

    // Random tools
    'random.coinflip.title': 'Coin Flip',
    'random.coinflip.flip': 'Flip Coin',
    'random.coinflip.heads': 'Heads',
    'random.coinflip.tails': 'Tails',
    'random.coinflip.result': 'Result',
    'random.coinflip.description': 'Classic decision helper - heads or tails?',
    'random.coinflip.flipping': 'Coin is flipping...',
    'random.coinflip.stats': 'Statistics',
    'random.coinflip.historyTitle': 'Your flip history',
    'random.coinflip.total': 'Total',
    'random.coinflip.headRate': 'Heads rate',
    'random.coinflip.headsLabel': 'Heads',
    'random.coinflip.tailsLabel': 'Tails',
    'random.coinflip.recentFlips': 'Recent flips',
    'random.coinflip.none': 'No flips yet',
    
    'random.wheel.title': 'Wheel of Fortune',
    'random.wheel.description': 'Let the wheel decide! Add your own options and spin the wheel.',
    'random.wheel.spin': 'Spin!',
    'random.wheel.spinning': 'Spinning...',
    'random.wheel.add': 'Add Option',
    'random.wheel.addPlaceholder': 'New option...',
    'random.wheel.currentOptions': 'Current Options',
    'random.wheel.reset': 'Reset',
    'random.wheel.result': 'Result:',
    'random.wheel.tooFewOptions': 'You need at least 2 options to spin.',
    'random.wheel.minOptions': 'You need at least 2 options.',
    'random.wheel.optionsCount': 'Options',
    'random.wheel.instructions': 'Click "Spin" to start the wheel',
    
    'random.number.title': 'Random Number',
    'random.number.description': 'Generate a random number between your chosen values.',
    'random.number.generate': 'Generate',
    'random.number.min': 'Minimum',
    'random.number.max': 'Maximum',
    'random.number.result': 'Random Number',
    'random.number.generating': 'Generating...',
    'random.number.rangeTitle': 'Number range',
    'random.number.rangeSubtitle': 'Set your desired range',
    'random.number.invalidRange': 'Invalid range! Minimum must be less than maximum.',
    'random.number.possible': 'Possible numbers',
    'random.number.presets': 'Presets:',
    'random.number.historyTitle': 'History',
    'random.number.historySubtitle': 'Last 10 numbers',
    'random.number.historyEmpty': 'No numbers generated yet',
    'random.number.statsTitle': 'Statistics',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.reset': 'Reset',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.darkMode': 'Dark Mode',
    'common.lightMode': 'Light Mode',
    
    // Weather conditions
    'weather.conditions.sunny': 'Sunny',
    'weather.conditions.cloudy': 'Cloudy',
    'weather.conditions.rainy': 'Rainy',
    'weather.conditions.snowy': 'Snowy',
    'weather.conditions.stormy': 'Stormy',
    'weather.conditions.foggy': 'Foggy',
    'weather.conditions.partlyCloudy': 'Partly Cloudy',
    
    // Weather tips
    'weather.tips.cold': '❄️ Watch out for ice!',
    'weather.tips.hot': '☀️ Don\'t forget sun protection!',
    'weather.tips.rainy': '🌧️ Take an umbrella!',
    'weather.tips.windy': '💨 Strong wind - great for kite flying!',
    'weather.tips.perfect': '🌡️ Perfect weather for a walk!',

    // Gamble section
    'gamble.landing.title': 'Gamble',
    'gamble.landing.subtitle': 'Lobby with leaderboard and links to games',

    // Animations common
    'animations.lose': 'You lost!',

    // RiskPlay
    'riskplay.title': 'RiskPlay',
    'riskplay.subtitle': 'Choose your bet, play, and win with risk.',
    'riskplay.balance': 'Balance',
    'riskplay.reset': 'Reset',
    'riskplay.bet': 'Bet',
    'riskplay.quickBets.max': 'Max',
    'riskplay.betChanceTitle': 'Bet & Win Chance',
    'riskplay.betChanceDescription': 'Quick bet buttons and maximum bet',
    'riskplay.winChance': 'Win chance',
    'riskplay.multiplier': 'Multiplier',
    'riskplay.potentialWin': 'Potential win',
    'riskplay.play': 'Play',
    'riskplay.playing': 'Playing...',
    'riskplay.note.title': 'Note',
    'riskplay.note.text': 'Play responsibly. Only bet what you are willing to lose.',
    'riskplay.leaderboardSaved': 'Wins are saved to the leaderboard.',

    // High Risk Clicker
    'hrc.title': 'High Risk Clicker',
    'hrc.subtitle': 'Each click increases the chance of losing by 1%.',
    'hrc.clicks': 'Clicks',
    'hrc.loseChance': 'Lose chance',
    'hrc.click': 'CLICK',
    'hrc.gameOver': 'Game Over',
    'hrc.score': 'Score',
    'hrc.retry': 'Retry',

    // Blackjack page
    'blackjack.title': 'Blackjack',
    'blackjack.subtitle': 'Play against the dealer. Dealer hits <17.',
    'blackjack.cta.newRound': 'New Round',
    'blackjack.cta.hit': 'Hit',
    'blackjack.cta.stand': 'Stand',
    'blackjack.msg.playerBust': 'Bust! Dealer wins.',
    'blackjack.msg.dealerBust': 'Dealer bust! You win.',
    'blackjack.msg.playerWin': 'You win!',
    'blackjack.msg.dealerWin': 'Dealer wins!',
    'blackjack.msg.push': 'Push!',
    'blackjack.dealer': 'Dealer',
    'blackjack.player': 'Player',
    'blackjack.hiddenCard': 'One card hidden',
    'blackjack.total': 'Total points',
    // Added keys for enhanced Blackjack UI
    'blackjack.balance': 'Balance',
    'blackjack.currentBet': 'Current bet',
    'blackjack.clearBet': 'Clear bet',
    'blackjack.placeBetAndDeal': 'Place bet & deal',
    'blackjack.cta.double': 'Double',
    'blackjack.cta.split': 'Split',

    // Leaderboards
    'leaderboard.title': 'Leaderboards',
    'leaderboard.empty': 'No entries yet',

    // Additional animations
    'animations.won': 'Won',
  }
};