import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { TaxUpdates } from "../components/TaxUpdates";
import { AIChat } from "../components/AIChat";
import { ComplianceStandards } from "../components/ComplianceStandards";

interface HomeProps {
  onContactCPA: () => void;
  onRequireLogin: () => void;
}

export function Home({ onContactCPA, onRequireLogin }: HomeProps) {
  const scrollToAIChat = () => {
    const element = document.getElementById('ai-chat');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Hero 
        onAskAI={scrollToAIChat}
        onContactCPA={onContactCPA}
      />
      
      <section id="features">
        <Features />
      </section>
      
      <section id="updates">
        <TaxUpdates />
      </section>
      
      <section id="ai-chat">
        <AIChat onRequireLogin={onRequireLogin} />
      </section>
      
      <section id="compliance">
        <ComplianceStandards />
      </section>
    </>
  );
}
