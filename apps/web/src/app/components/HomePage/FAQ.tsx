import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function FAQ() {
  const questions = [
    {
      question: "Is Awoof free to use?",
      answer: "Yes, Awoof is completely free for students! You can sign up, verify your student status, and access exclusive discounts without any subscription fees or hidden costs.",
    },
    {
      question: "Where can I use awoof deals?",
      answer: "You can use Awoof deals at any of our partner businesses including restaurants, tech stores, fashion outlets, travel agencies, and more. Each deal shows the specific locations and businesses where it can be redeemed.",
    },
    {
      question: "Can I access deals without verifying?",
      answer: "No, verification is required to access deals. This ensures that only legitimate students benefit from the exclusive discounts and helps maintain the integrity of our platform for both students and businesses.",
    },
    {
      question: "What kind of businesses can join Awoof?",
      answer: "Any business interested in reaching student customers can join Awoof! We welcome restaurants, retail stores, tech companies, entertainment venues, travel services, and more. Businesses of all sizes can create an account and list their student deals.",
    },
    {
      question: "Is there a cost to list deals on Awoof?",
      answer: "We offer flexible options for businesses. Basic listing is free, allowing you to reach our student community. Premium features and enhanced visibility options are available for businesses looking to maximize their reach.",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <div className="pt-9">
        <p className="inline-block bg-gradient-to-b from-[#CAD5F6] to-[#FFFFFF] bg-clip-text text-transparent font-black text-[10.85vw] leading-tight">
          Frequently Asked
        </p>
      </div>

      <div className="w-full max-w-3xl mt-8">
        <Accordion type="single" collapsible className="w-full space-y-4" >
          {questions.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className=""
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export default FAQ;