"use client";

import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { ArrowLeft, ArrowRight, Download, X, Maximize2 } from "lucide-react";

export default function PerformancePage() {
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showLyrics, setShowLyrics] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hideTopbar, setHideTopbar] = useState(false);
  const [fontSize, setFontSize] = useState(24); // Base font size
  const [performanceStarted, setPerformanceStarted] = useState(false);

  const { data: rounds, isLoading: roundsLoading } = api.rounds.list.useQuery();

  const { data: performanceData, isLoading: performanceLoading } =
    api.performance.getPerformanceData.useQuery(
      { roundIds: selectedRounds },
      { enabled: selectedRounds.length > 0 && performanceStarted }
    );

  const handleStart = () => {
    if (selectedRounds.length > 0) {
      setPerformanceStarted(true);
      setCurrentSongIndex(0);
      setShowLyrics(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (fullscreen) {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          if (currentSongIndex > 0) {
            setCurrentSongIndex(currentSongIndex - 1);
          }
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          if (performanceData && currentSongIndex < performanceData.songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
          }
        }
        if (e.key === "f" || e.key === "F") {
          setFullscreen(false);
        }
        if (e.key === "Escape") {
          setFullscreen(false);
        }
        if (e.key === "h" || e.key === "H") {
          setHideTopbar(!hideTopbar);
        }
        if (e.key === "=" || e.key === "+") {
          setFontSize(prev => Math.min(prev + 2, 36));
        }
        if (e.key === "-" || e.key === "_") {
          setFontSize(prev => Math.max(prev - 2, 18));
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [fullscreen, currentSongIndex, performanceData, hideTopbar]);

  const handleNext = () => {
    if (performanceData && currentSongIndex < performanceData.songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const toggleRound = (roundId: number) => {
    setSelectedRounds((prev) =>
      prev.includes(roundId)
        ? prev.filter((id) => id !== roundId)
        : [...prev, roundId]
    );
  };

  const exportToPDF = async () => {
    if (!performanceData) {
      alert("No performance data available");
      return;
    }

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert("Please allow popups to export PDF");
        return;
      }

      // Generate the HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Performance PDF Export</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #000;
                background: #fff;
              }
              .song {
                margin-bottom: 60px;
                page-break-inside: avoid;
                position: relative;
                min-height: 600px;
              }
              .song-title {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .song-round {
                font-size: 20px;
                color: #666;
                margin-bottom: 10px;
              }
              .song-info {
                font-size: 14px;
                color: #555;
                margin-bottom: 20px;
                font-style: italic;
              }
              .song-info span {
                margin-right: 15px;
              }
              .song-lyrics {
                font-size: 18px;
                line-height: 1.6;
                white-space: pre-wrap;
                font-family: Georgia, serif;
              }
              .next-song {
                position: absolute;
                bottom: 10px;
                right: 0;
                text-align: right;
                font-size: 12px;
                color: #888;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                width: 40%;
              }
              .next-song-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .next-song-info {
                font-size: 10px;
                font-style: italic;
              }
              .next-song-info span {
                margin-right: 10px;
              }
              @media print {
                body {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            ${performanceData.songs.map((song, index) => {
              const nextSong = performanceData.songs[index + 1];
              return `
              <div class="song">
                <div class="song-title">${song.title}</div>
                ${song.roundName ? `<div class="song-round">${song.roundName}</div>` : ''}
                <div class="song-info">
                  ${song.key ? `<span>Key: ${song.key}</span>` : ''}
                  ${song.harmonica ? `<span>Accordion: ${song.harmonica.replace(/_/g, '-').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}</span>` : ''}
                  ${song.bas_bariton ? `<span>${song.bas_bariton}</span>` : ''}
                </div>
                <div class="song-lyrics">${song.lyrics}</div>
                ${nextSong ? `
                  <div class="next-song">
                    <div class="next-song-title">Next: ${nextSong.title}</div>
                    <div class="next-song-info">
                      ${nextSong.key ? `<span>Key: ${nextSong.key}</span>` : ''}
                      ${nextSong.harmonica ? `<span>Acc: ${nextSong.harmonica.replace(/_/g, '-').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}</span>` : ''}
                      ${nextSong.bas_bariton ? `<span>${nextSong.bas_bariton}</span>` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
            }).join('')}
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF. Please try again.");
    }
  };

  if (roundsLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (performanceStarted && performanceData && performanceData.songs.length > 0) {
    const currentSong = performanceData.songs[currentSongIndex];
    const nextSong = performanceData.songs[currentSongIndex + 1];
    const previousSong = performanceData.songs[currentSongIndex - 1];

    // Fullscreen performance view
    if (fullscreen) {
      return (
        <div className="fixed inset-0 bg-gradient-to-b from-background to-background z-50 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Top bar - hidden if hideTopbar is true */}
            {!hideTopbar && (
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 animate-in slide-in-from-top">
                <div className="container mx-auto px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentSongIndex === 0}
                        size="lg"
                        variant="ghost"
                        className="h-14 text-xl"
                      >
                        <ArrowLeft className="mr-2 h-7 w-7" />
                        Previous
                      </Button>

                      <div className="text-center">
                        <p className="text-2xl font-semibold">
                          Song {currentSongIndex + 1} of {performanceData.songs.length}
                        </p>
                      </div>

                      <Button
                        onClick={handleNext}
                        disabled={currentSongIndex === performanceData.songs.length - 1}
                        size="lg"
                        variant="ghost"
                        className="h-14 text-xl"
                      >
                        Next
                        <ArrowRight className="ml-2 h-7 w-7" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded">
                        <button
                          onClick={() => setFontSize(Math.max(fontSize - 2, 18))}
                          className="text-xl px-2 hover:bg-background rounded"
                        >
                          A-
                        </button>
                        <button
                          onClick={() => setFontSize(Math.min(fontSize + 2, 36))}
                          className="text-xl px-2 hover:bg-background rounded"
                        >
                          A+
                        </button>
                      </div>
                      <Button
                        onClick={() => setShowLyrics(!showLyrics)}
                        variant="secondary"
                        size="lg"
                      >
                        {showLyrics ? "Hide" : "Show"} Lyrics
                      </Button>
                      <Button
                        onClick={() => setHideTopbar(true)}
                        variant="ghost"
                        size="lg"
                        title="Hide (Press H to show again)"
                      >
                        Hide Bar
                      </Button>
                      <Button
                        onClick={() => setFullscreen(false)}
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>

                  {/* Horizontal scrollbar for song navigation */}
                  {!hideTopbar && (
                    <div className="w-full overflow-x-auto">
                      <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                        {performanceData.songs.map((song, index) => (
                          <button
                            key={song.id}
                            onClick={() => setCurrentSongIndex(index)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                              index === currentSongIndex
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {index + 1}. {song.title.substring(0, 30)}
                            {song.title.length > 30 ? '...' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show topbar button when hidden */}
            {hideTopbar && (
              <div className="sticky top-4 left-4 z-10 w-fit">
                <Button
                  onClick={() => setHideTopbar(false)}
                  size="lg"
                  variant="secondary"
                  className="shadow-lg"
                >
                  Show Controls (H)
                </Button>
              </div>
            )}

            {/* Song content */}
            <div className={`flex-1 container mx-auto px-6 py-12 ${hideTopbar ? 'pt-20' : ''}`}>
              <div className="max-w-5xl mx-auto">
                <h1 className="text-7xl font-bold mb-6 text-center">{currentSong.title}</h1>
                <p className="text-4xl text-muted-foreground mb-12 text-center">
                  {currentSong.roundName}
                </p>

                {showLyrics && (
                  <pre className="whitespace-pre-wrap bg-muted/50 p-12 rounded-2xl border-2 font-serif text-center" style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
                    {currentSong.lyrics}
                  </pre>
                )}

                {!hideTopbar && (
                  <div className="mt-12 flex items-center justify-center gap-12">
                    {previousSong && (
                      <div className="text-center">
                        <p className="text-lg text-muted-foreground mb-2">Previous</p>
                        <p className="text-2xl font-medium">{previousSong.title}</p>
                      </div>
                    )}
                    {nextSong && (
                      <div className="text-center">
                        <p className="text-lg text-muted-foreground mb-2">Next</p>
                        <p className="text-2xl font-medium">{nextSong.title}</p>
                      </div>
                    )}
                  </div>
                )}

                {!hideTopbar && (
                  <div className="mt-12 text-center text-lg text-muted-foreground space-y-2">
                    <p><strong>Keyboard shortcuts:</strong></p>
                    <p>← / → Navigate • H Hide/Show bar • + / - Font size • ESC Exit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Normal view
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Performance Mode</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSelectedRounds([]); setPerformanceStarted(false); }}>
              Back to Selection
            </Button>
            <Button onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => setFullscreen(true)} variant="secondary">
              <Maximize2 className="mr-2 h-4 w-4" />
              Full Screen
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentSongIndex === 0}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Song {currentSongIndex + 1} of {performanceData.songs.length}
            </p>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentSongIndex === performanceData.songs.length - 1}
            variant="outline"
            size="lg"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{currentSong.title}</CardTitle>
              <Button
                variant="secondary"
                onClick={() => setShowLyrics(!showLyrics)}
              >
                {showLyrics ? "Hide" : "Show"} Lyrics
              </Button>
            </div>
            <p className="text-muted-foreground">{currentSong.roundName}</p>
          </CardHeader>
          <CardContent>
            {showLyrics && (
              <pre className="whitespace-pre-wrap text-lg leading-relaxed font-serif">
                {currentSong.lyrics}
              </pre>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {previousSong && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Previous</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{previousSong.title}</p>
                <p className="text-sm text-muted-foreground">{previousSong.roundName}</p>
              </CardContent>
            </Card>
          )}
          {nextSong && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Next</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{nextSong.title}</p>
                <p className="text-sm text-muted-foreground">{nextSong.roundName}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hidden content for PDF export */}
        <div id="print-content" className="hidden bg-white text-black p-8">
          <div className="max-w-4xl mx-auto">
            {performanceData.songs.map((song, index) => (
              <div key={song.id} className="mb-12" style={{ pageBreakAfter: 'auto' }}>
                <h1 className="text-3xl font-bold mb-3">{song.title}</h1>
                {song.roundName && <p className="text-xl text-gray-600 mb-4">{song.roundName}</p>}
                <div className="text-base leading-relaxed whitespace-pre-wrap font-serif">
                  {song.lyrics}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">Performance Mode</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Select Rounds for Performance</CardTitle>
            {selectedRounds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedRounds.length}</span> round{selectedRounds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedRounds.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Total songs:{" "}
                <span className="font-semibold text-foreground">
                  {rounds
                    ?.filter((r) => selectedRounds.includes(r.id))
                    .reduce((sum, r) => sum + r.roundItems.length, 0)}
                </span>
              </p>
            </div>
          )}
          <div className="space-y-4">
            {rounds?.map((round) => (
              <div key={round.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`round-${round.id}`}
                  checked={selectedRounds.includes(round.id)}
                  onChange={() => toggleRound(round.id)}
                />
                <Label
                  htmlFor={`round-${round.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">{round.name}</p>
                    {round.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {round.description}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {round.roundItems.length} song
                      {round.roundItems.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleStart}
        disabled={selectedRounds.length === 0}
        size="lg"
        className="w-full sm:w-auto"
      >
        Start Performance
      </Button>

      {selectedRounds.length > 0 && performanceLoading && (
        <p className="mt-4 text-center text-muted-foreground">Loading...</p>
      )}
    </div>
  );
}


