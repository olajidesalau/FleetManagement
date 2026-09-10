type PolicySection = { title: string; paragraphs: string[] }

export const PolicyPage = ({ title, eyebrow, sections }: { title: string; eyebrow: string; sections: PolicySection[] }) => (
  <div class="fleet-dashboard policy-page">
    <div class="page-heading">
      <div><p class="eyebrow">{eyebrow}</p><h1>{title}</h1><p class="header-copy">Snow Fleet Management policies for safe, accountable fleet operations.</p></div>
    </div>
    <section class="panel policy-panel">
      {sections.map(section => <article><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p>{paragraph}</p>)}</article>)}
    </section>
  </div>
)
