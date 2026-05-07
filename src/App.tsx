import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell/AppShell'
import { db } from './db/db'
import { seedPlants } from './db/seedPlants'
import { useAppStore } from './store'
import './styles/globals.css'

export default function App() {
  const [ready, setReady] = useState(false)
  const { setActiveGardenId } = useAppStore()

  useEffect(() => {
    async function init() {
      await db.open()
      await seedPlants()
      const gardens = await db.gardens.toArray()
      if (gardens.length > 0) {
        setActiveGardenId(gardens[0].id)
      }
      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <span className="text-4xl animate-pulse">🌱</span>
          <span className="text-sm">Loading garden...</span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
