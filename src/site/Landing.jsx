import styles from './site.module.css'
import Hero from './Hero'
import PainPoints from './PainPoints'
import FeatureNav from './FeatureNav'
import Roadmap from './Roadmap'
import Glossary from './Glossary'
import Quiz from './Quiz'
import GreeksLab from './GreeksLab'
import MockExam from './MockExam'
import Footer from './Footer'
import { useBot } from '../context/BotContext'

export default function Landing() {
  const { openDock } = useBot()
  return (
    <main className={styles.page}>
      <Hero />
      <PainPoints />
      <FeatureNav onOpenBot={openDock} />
      <Roadmap />
      <Glossary />
      <Quiz />
      <GreeksLab />
      <MockExam />
      <Footer />
    </main>
  )
}
