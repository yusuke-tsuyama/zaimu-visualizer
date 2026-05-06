'use client'

import { useState } from 'react'
import SplashScreen from '@/components/SplashScreen'
import TermsScreen from '@/components/TermsScreen'
import TutorialScreen from '@/components/TutorialScreen'
import MainScreen from '@/components/MainScreen'

type Screen = 'splash' | 'terms' | 'tutorial' | 'main'

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('splash')

  return (
    <>
      {screen === 'splash' && (
        <SplashScreen onDone={() => setScreen('terms')} />
      )}
      {screen === 'terms' && (
        <TermsScreen onAgree={() => setScreen('tutorial')} />
      )}
      {screen === 'tutorial' && (
        <TutorialScreen onStart={() => setScreen('main')} />
      )}
      {screen === 'main' && <MainScreen />}
    </>
  )
}
