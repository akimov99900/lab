'use client'

import { useState } from 'react'
import { createBearBrickTokenUri } from '@lab/nft-utils'

export default function Home() {
  const [fid, setFid] = useState('')
  const [username, setUsername] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [nftData, setNftData] = useState<{metadata: {name: string, description: string, image: string, attributes: {trait_type: string, value: string | number}[]}, tokenUri: string} | null>(null)

  const generateNFT = async () => {
    if (!fid || !username) return

    setIsGenerating(true)
    try {
      const config = {
        colors: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
        },
        fid: parseInt(fid),
        username,
      }

      const { metadata, tokenUri } = createBearBrickTokenUri(config)
      setNftData({ metadata, tokenUri })
    } catch (error) {
      console.error('Error generating NFT:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          BearBrick NFT Generator
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Create Your BearBrick
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farcaster ID (FID)
              </label>
              <input
                type="number"
                value={fid}
                onChange={(e) => setFid(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Farcaster ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            
            <button
              onClick={generateNFT}
              disabled={!fid || !username || isGenerating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate BearBrick NFT'}
            </button>
          </div>
        </div>

        {nftData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              Your BearBrick NFT
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-600">Preview</h3>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  {nftData.metadata.image.startsWith('data:image/svg+xml;base64,') ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: atob(nftData.metadata.image.replace('data:image/svg+xml;base64,', '')) 
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Preview not available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-600">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {nftData.metadata.name}</p>
                  <p><strong>Description:</strong> {nftData.metadata.description}</p>
                  <div>
                    <strong>Attributes:</strong>
                    <ul className="ml-4 mt-2">
                      {nftData.metadata.attributes.map((attr: {trait_type: string, value: string | number}, index: number) => (
                        <li key={index} className="text-gray-600">
                          {attr.trait_type}: {attr.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2 text-gray-600">Token URI (for minting)</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                    {nftData.tokenUri}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}