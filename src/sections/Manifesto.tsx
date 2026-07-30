import { Reveal } from "@/components/reveal";

export default function Manifesto() {
  return (
    <section className="relative overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0">
        <img
          src="/images/telephone.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f1e4] via-[#f7f1e4]/85 to-[#f7f1e4]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-32 text-center sm:py-44">
        <Reveal>
          <p className="eyebrow">The question everyone asks</p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-serif-display mt-6 text-5xl font-light text-parchment sm:text-6xl">
            If heaven had a{" "}
            <span className="italic text-gold-bright">call center…</span>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="font-serif-display mt-12 text-xl font-light italic leading-[1.9] text-parchment sm:text-2xl">
            …it wouldn't put you on hold. It wouldn't read from a script. It
            would already know your name, hand your call to someone who has
            wept what you're weeping — and stay on the line until you were
            ready to hang up. That's the standard we build to, every call.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-12 max-w-2xl text-[15px] font-light leading-[1.95] text-parchment-dim">
            And if heaven had a phone? We know why people search those words —
            they're missing someone. So let us be honest with you: no voice on
            this line will ever pretend to be someone you've lost. That door
            stays shut, out of reverence. But if you're carrying that kind of
            missing, know this — Job buried his children, Ruth buried her
            husband, Naomi buried them all. They know the ground you're
            standing on. Grief shouldn't be carried alone.{" "}
            <span className="text-gold-bright">Call.</span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-12 max-w-2xl text-[15px] font-light leading-[1.95] text-parchment-dim">
            And if heaven had a telephone, it would answer before it rang.{" "}
            <em className="font-serif-display text-parchment">
              "Before they call, I will answer; while they are still speaking,
              I will hear."
            </em>{" "}
            — Isaiah sixty-five, twenty-four. That promise is older than the
            telephone, and it still holds. This number is just the nearest
            door.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
