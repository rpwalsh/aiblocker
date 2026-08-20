# Disclaimer and Responsible Use

## What SlopBlocker is

SlopBlocker is a signal highlighter. It reports statistical and forensic
signals that are *consistent with* machine-generated or manipulated
content, together with the exact deterministic rules that produced each
signal. It does not, and cannot, determine who authored a piece of
content or how it was produced.

## What its results are not

- **Not proof.** A score or flag is a probabilistic lead with a measured
  error rate (published in the README and reproducible from this
  repository). Human writing is regularly flagged by every detection
  method in existence, including this one.
- **Not an accusation.** No output of this software states or implies
  that any specific person used AI, cheated, plagiarized, or engaged in
  misconduct, and no output should be repeated as such a statement.
- **Not a basis for adverse action.** Do not use SlopBlocker's output as
  the sole or primary basis for any grade, disciplinary decision,
  employment decision, moderation penalty, or other adverse action
  against any person. Institutions that act against individuals based
  solely on automated detection do so against the explicit guidance of
  this project.

## Guidance for educators and institutions

If you use SlopBlocker while reviewing student or employee work:

1. Treat the output as one input to a human process, never a verdict.
2. Give the person a chance to respond before drawing any conclusion;
   the evidence report exists precisely so it can be shown to and
   checked by the person concerned.
3. Consider innocent explanations for every signal — formal writing
   style, non-native phrasing, dictation software, editors that insert
   special characters, and template-based writing all produce signals.
4. Keep in mind the measured false-positive rate: at default settings,
   roughly 1 in 20 human-written samples in our held-out benchmarks
   scores above the flag threshold.

## No warranty; limitation of liability

This software is provided "as is", without warranty of any kind, as set
out in the [PolyForm Noncommercial License 1.0.0](LICENSE). To the
maximum extent permitted by law, the author is not liable for any
decision, action, or consequence arising from use of this software or
its output, including decisions made by third parties who rely on it.

## Trademarks and third parties

Product names mentioned in detection lists and documentation (for
example Microsoft Word, Google Docs, ChatGPT) are trademarks of their
respective owners, referenced solely to describe interoperability and
detection behavior. This project is not affiliated with or endorsed by
any of them.
