'use client';

import { useState } from 'react';
import { extractBioFromHTML } from '@/lib/html-utils';
import { generatePlayerSlug } from '@/lib/utils';

// Core players list
const corePlayers = [
  'Alfredo Triff',
  'Andy Gonzalez',
  'Astor Piazzolla',
  'Charles Neville',
  'Don Pullen',
  'Fernando Saunders',
  'Horacio "El Negro" Hernandez',
  'Ishmael Reed',
  'Jack Bruce',
  'Milton Cardona',
  '"Puntilla" Orlando Rios',
  'Robby Ameen',
  'Silvana DeLuigi',
];

export default function BioImportPage() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [extractedBio, setExtractedBio] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExtract = () => {
    if (!htmlInput.trim()) {
      alert('Please paste the HTML content first');
      return;
    }
    
    const bio = extractBioFromHTML(htmlInput);
    setExtractedBio(bio);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAsJSON = () => {
    if (!selectedPlayer) {
      alert('Please select a player first');
      return;
    }
    
    const json = JSON.stringify({
      playerName: selectedPlayer,
      bio: extractedBio,
      slug: generatePlayerSlug(selectedPlayer),
    }, null, 2);
    
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-[#bc7d30] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Player Bio Import Tool</h1>
        
        <div className="space-y-6">
          {/* Player Selection */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              Select Player:
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] focus:outline-none focus:border-[#bc7d30]/60"
            >
              <option value="">-- Select a player --</option>
              {corePlayers.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>

          {/* HTML Input */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              Paste HTML Content:
            </label>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste the HTML content here (e.g., the &lt;td&gt; or &lt;p class='pullquote'&gt; content)..."
              className="w-full h-64 px-4 py-2 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] placeholder-[#bc7d30]/50 focus:outline-none focus:border-[#bc7d30]/60 font-mono text-sm"
            />
            <button
              onClick={handleExtract}
              className="mt-2 px-6 py-2 bg-[#bc7d30] text-black font-bold rounded hover:bg-[#bc7d30]/80 transition-colors"
            >
              Extract Bio Text
            </button>
          </div>

          {/* Extracted Bio */}
          {extractedBio && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold">
                  Extracted Bio Text:
                </label>
                <div className="space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-1 bg-[#bc7d30] text-black font-bold rounded hover:bg-[#bc7d30]/80 transition-colors text-sm"
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    onClick={handleCopyAsJSON}
                    className="px-4 py-1 bg-[#bc7d30] text-black font-bold rounded hover:bg-[#bc7d30]/80 transition-colors text-sm"
                  >
                    Copy as JSON
                  </button>
                </div>
              </div>
              <textarea
                value={extractedBio}
                readOnly
                className="w-full h-96 px-4 py-2 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] focus:outline-none font-mono text-sm whitespace-pre-wrap"
              />
              <p className="mt-2 text-sm text-[#bc7d30]/60">
                Character count: {extractedBio.length}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-black/50 border border-[#bc7d30]/20 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-[#bc7d30]/80">
              <li>Select the player from the dropdown</li>
              <li>Paste the HTML content (the entire &lt;td&gt; or &lt;p&gt; tag with the bio)</li>
              <li>Click "Extract Bio Text" to clean and extract the text</li>
              <li>Review the extracted text</li>
              <li>Copy the text (or JSON) and use it to update the player bio in your database</li>
            </ol>
            <p className="mt-4 text-sm text-[#bc7d30]/60">
              <strong>Note:</strong> This tool extracts and cleans the text. You'll need to update the bio 
              in your D1 database directly or through your D1 worker's update endpoint.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

