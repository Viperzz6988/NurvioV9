import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shuffle, Dice1, Hash, Type, Calendar, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ZufallsgeneratorPage = () => {
  const [numberMin, setNumberMin] = useState(1);
  const [numberMax, setNumberMax] = useState(100);
  const [numberResult, setNumberResult] = useState<number | null>(null);
  
  const [textLength, setTextLength] = useState(8);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [textResult, setTextResult] = useState<string>('');

  const [colorResult, setColorResult] = useState<string>('#3B82F6');
  
  const [dateStartYear, setDateStartYear] = useState(2020);
  const [dateEndYear, setDateEndYear] = useState(2024);
  const [dateResult, setDateResult] = useState<string>('');

  const { toast } = useToast();

  const generateNumber = () => {
    if (numberMin > numberMax) {
      toast({
        title: "Ungültige Eingabe",
        description: "Der Minimalwert muss kleiner als der Maximalwert sein.",
        variant: "destructive"
      });
      return;
    }
    
    // Use crypto.getRandomValues for truly random numbers
    const range = numberMax - numberMin + 1;
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const result = Math.floor((randomArray[0] / (2**32)) * range) + numberMin;
    setNumberResult(result);
  };

  const generateText = () => {
    if (textLength < 1 || textLength > 100) {
      toast({
        title: "Ungültige Länge",
        description: "Die Textlänge muss zwischen 1 und 100 Zeichen liegen.",
        variant: "destructive"
      });
      return;
    }

    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars === '') {
      toast({
        title: "Keine Zeichen ausgewählt",
        description: "Wähle mindestens eine Zeichenart aus.",
        variant: "destructive"
      });
      return;
    }

    let result = '';
    for (let i = 0; i < textLength; i++) {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomIndex = Math.floor((randomArray[0] / (2**32)) * chars.length);
      result += chars.charAt(randomIndex);
    }
    setTextResult(result);
  };

  const generateColor = () => {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const hex = '#' + Math.floor((randomArray[0] / (2**32)) * 16777215).toString(16).padStart(6, '0');
    setColorResult(hex);
  };

  const generateDate = () => {
    const start = new Date(dateStartYear, 0, 1);
    const end = new Date(dateEndYear, 11, 31);
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomTime = start.getTime() + (randomArray[0] / (2**32)) * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTime);
    setDateResult(randomDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: `${type} wurde in die Zwischenablage kopiert.`,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Zufallsgenerator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generiere zufällige Zahlen, Texte, Farben und Daten für alle deine Bedürfnisse.
          </p>
        </div>

        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass mb-8">
            <TabsTrigger value="numbers" className="flex items-center space-x-2">
              <Hash size={16} />
              <span className="hidden sm:inline">Zahlen</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <Type size={16} />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-primary"></div>
              <span className="hidden sm:inline">Farben</span>
            </TabsTrigger>
            <TabsTrigger value="dates" className="flex items-center space-x-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Daten</span>
            </TabsTrigger>
          </TabsList>

          {/* Numbers Tab */}
          <TabsContent value="numbers">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash size={24} />
                  <span>Zufallszahl generieren</span>
                </CardTitle>
                <CardDescription>
                  Generiere eine Zufallszahl zwischen zwei Werten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Minimalwert</Label>
                    <Input
                      id="min"
                      type="number"
                      value={numberMin}
                      onChange={(e) => setNumberMin(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Maximalwert</Label>
                    <Input
                      id="max"
                      type="number"
                      value={numberMax}
                      onChange={(e) => setNumberMax(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={generateNumber} className="w-full bg-gradient-primary hover:shadow-hover">
                  <Dice1 className="mr-2" size={20} />
                  Zufallszahl generieren
                </Button>

                {numberResult !== null && (
                  <div className="glass-card p-6 text-center animate-scale-in">
                    <p className="text-sm text-muted-foreground mb-2">Ergebnis:</p>
                    <p className="text-4xl font-bold text-primary mb-4">{numberResult}</p>
                    <Button 
                      onClick={() => copyToClipboard(numberResult.toString(), 'Zahl')}
                      variant="outline"
                      size="sm"
                    >
                      Kopieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Type size={24} />
                  <span>Zufallstext generieren</span>
                </CardTitle>
                <CardDescription>
                  Erstelle zufällige Zeichenketten für Passwörter oder Tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="length">Textlänge</Label>
                  <Input
                    id="length"
                    type="number"
                    min="1"
                    max="100"
                    value={textLength}
                    onChange={(e) => setTextLength(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="rounded"
                    />
                    <span>Großbuchstaben (A-Z)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                      className="rounded"
                    />
                    <span>Kleinbuchstaben (a-z)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="rounded"
                    />
                    <span>Zahlen (0-9)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="rounded"
                    />
                    <span>Symbole (!@#$...)</span>
                  </label>
                </div>

                <Button onClick={generateText} className="w-full bg-gradient-primary hover:shadow-hover">
                  <Shuffle className="mr-2" size={20} />
                  Zufallstext generieren
                </Button>

                {textResult && (
                  <div className="glass-card p-6 animate-scale-in">
                    <p className="text-sm text-muted-foreground mb-2">Ergebnis:</p>
                    <p className="font-mono text-lg break-all bg-muted p-3 rounded mb-4">{textResult}</p>
                    <Button 
                      onClick={() => copyToClipboard(textResult, 'Text')}
                      variant="outline"
                      size="sm"
                    >
                      Kopieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-primary"></div>
                  <span>Zufallsfarbe generieren</span>
                </CardTitle>
                <CardDescription>
                  Entdecke neue Farben für deine Projekte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={generateColor} className="w-full bg-gradient-primary hover:shadow-hover">
                  <RefreshCw className="mr-2" size={20} />
                  Zufallsfarbe generieren
                </Button>

                <div className="glass-card p-6 text-center animate-scale-in">
                  <p className="text-sm text-muted-foreground mb-4">Generierte Farbe:</p>
                  <div 
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-border shadow-lg"
                    style={{ backgroundColor: colorResult }}
                  ></div>
                  <p className="font-mono text-xl font-bold mb-4">{colorResult}</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      onClick={() => copyToClipboard(colorResult, 'Farbe')}
                      variant="outline"
                      size="sm"
                    >
                      Kopieren
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(colorResult.replace('#', ''), 'Farbe (ohne #)')}
                      variant="outline"
                      size="sm"
                    >
                      Ohne # kopieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dates Tab */}
          <TabsContent value="dates">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar size={24} />
                  <span>Zufallsdatum generieren</span>
                </CardTitle>
                <CardDescription>
                  Generiere ein zufälliges Datum in einem bestimmten Zeitraum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startYear">Von Jahr</Label>
                    <Input
                      id="startYear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={dateStartYear}
                      onChange={(e) => setDateStartYear(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endYear">Bis Jahr</Label>
                    <Input
                      id="endYear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={dateEndYear}
                      onChange={(e) => setDateEndYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={generateDate} className="w-full bg-gradient-primary hover:shadow-hover">
                  <Calendar className="mr-2" size={20} />
                  Zufallsdatum generieren
                </Button>

                {dateResult && (
                  <div className="glass-card p-6 text-center animate-scale-in">
                    <p className="text-sm text-muted-foreground mb-2">Generiertes Datum:</p>
                    <p className="text-xl font-bold text-primary mb-4">{dateResult}</p>
                    <Button 
                      onClick={() => copyToClipboard(dateResult, 'Datum')}
                      variant="outline"
                      size="sm"
                    >
                      Kopieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ZufallsgeneratorPage;