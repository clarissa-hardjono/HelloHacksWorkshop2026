import { useState } from 'react'

function App() {
  const [selectedType, setSelectedType] = useState('')
  const [matchup, setMatchup] = useState(null)
  const [error, setError] = useState('')

  const types = [
    { name: 'Fire', color: 'bg-orange-100 text-orange-800 ring-orange-300' },
    { name: 'Water', color: 'bg-sky-100 text-sky-800 ring-sky-300' },
    { name: 'Grass', color: 'bg-lime-100 text-lime-800 ring-lime-300' },
    { name: 'Ground', color: 'bg-amber-100 text-amber-800 ring-amber-300' },
  ]

  function formatTypeNames(typeNames) {
    const names = typeNames.map((typeName) => typeName.charAt(0).toUpperCase() + typeName.slice(1))

    if (names.length < 2) {
      return names[0] || 'none'
    }

    return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
  }

  async function getMatchup(type) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/matchup?type=${encodeURIComponent(type)}`,
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch (requestError) {
      console.error('Matchup request failed:', requestError)
      return null
    }
  }

  async function handleTypeClick(type) {
    setSelectedType(type)
    setError('')

    const response = await getMatchup(type)

    if (!response) {
      setMatchup(null)
      setError('Unable to load matchup data.')
      return
    }

    setMatchup(response)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-[var(--color-pokeball-dark)] sm:px-8">
      <section className="mx-auto max-w-xl rounded-3xl border-2 border-[var(--color-pokemon-blue)] bg-white p-6 shadow-[0_8px_0_var(--color-pokemon-yellow)] sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border-4 border-[var(--color-pokeball-dark)] bg-[var(--color-pokeball-red)] text-lg font-black text-white">
            P
          </span>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-pokemon-blue)]">Battle desk</p>
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Pokemon Battle Assistant</h1>
        <p className="mt-3 max-w-md text-slate-600">Choose the opposing Pokemon&apos;s type to get started.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {types.map((type) => {
            const isSelected = selectedType === type.name

            return (
              <button
                key={type.name}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleTypeClick(type.name)}
                className={`rounded-xl px-3 py-3 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-pokemon-blue)] focus:ring-offset-2 ${type.color} ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
              >
                {type.name}
              </button>
            )
          })}
        </div>

        <div className="mt-6 min-h-6 text-sm font-semibold text-[var(--color-pokemon-blue)]" aria-live="polite">
          {error && <p>{error}</p>}
          {matchup && (
            <div className="space-y-2">
              <p>Against a {selectedType}-type Pokemon:</p>
              <p>Your attacks deal half damage to {formatTypeNames(matchup.half_damage_to)}.</p>
              <p>Watch out for {formatTypeNames(matchup.double_damage_from)} attacks. They deal double damage.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
