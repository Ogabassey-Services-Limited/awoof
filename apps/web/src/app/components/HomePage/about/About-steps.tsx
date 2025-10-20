export default function AboutSteps() {
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description:
        "Enter your matric number, school, and verify with a 6-digit email code.",
    },
    {
      number: 2,
      title: "Explore Exclusive Student Discounts",
      description:
        "From food and tech to fashion and travel all tailored just for students like you.",
    },
    {
      number: 3,
      title: "Redeem & Enjoy Your Awoof",
      description:
        'Tap "claim," show your code or voucher, and enjoy real savings no catch.',
    },
  ];

  return (
    <div className="max-w-lg">
      <div className="">
        {steps.map((step, index) => (
          <div key={step.number}>
            <div className="flex gap-4 p-6">
              {/* Step Number Circle */}
              <div className="flex-shrink-0">
                <div
                  className={`${
                    step.number === 1 ? "bg-[#1D4ED8] text-white" : "bg-white text-[#DEDEDE]"
                  } w-12 h-12 rounded-full flex items-center justify-center`}
                  // className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center"
                >
                  <span className=" font-bold text-xl">{step.number}</span>
                </div>
              </div>

              {/* Step Content */}
              <div
                className={`${
                  step.number === 1 ? "border-2 border-[#1D4ED8] " : "bg-white shadow-2xl"
                } flex-1 rounded-2xl p-6 `}
              >
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
