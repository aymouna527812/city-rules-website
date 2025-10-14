import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FAQ = {
  question: string;
  answer: string;
};

type FAQProps = {
  items: FAQ[];
};

export function FAQ({ items }: FAQProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
        <p className="text-sm text-slate-600">
          Answers are summarized from the city bylaw for quick reference. For the full context,
          follow the official links below.
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white"
      >
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index + 1}`}>
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
