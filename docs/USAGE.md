# Read your typing stats

[← Overview](../README.md) · [Setup](SETUP.md) · [Help](TROUBLESHOOTING.md)

Open **Typing mistakes** below **User stats** in Monkeytype’s account menu, or use the extension’s toolbar button. The page follows your Monkeytype theme and font.

## What counts as a mistake?

Each row belongs to the **character you were meant to type**, not the physical key or finger you used.

For example, if Monkeytype expects **c**:

| You do this | The stats record |
| --- | --- |
| Type **x** | One attempt at **c**, with one mistake; **x** appears under “Typed instead”. |
| Press Backspace | One manual deletion. The mistake stays recorded. |
| Type **c** | Another attempt at **c**, this time correct. |

That sequence gives **2 attempts, 1 mistake, and a 50% error rate** for **c**. Spaces and punctuation can have their own rows too.

The rate describes these character attempts, so it can differ from Monkeytype’s overall accuracy. Letters you never try to type aren’t invented as attempts. Characters typed beyond the end of a word are counted separately as **extra insertions**.

## Choose what to practise

**Practice focus** shows up to three characters with the highest error rates, once each has at least **20 attempts**. It’s a suggestion based on your sample, not a typing lesson or a diagnosis of which finger needs work.

“Building your sample” or “More attempts will help” means there isn’t enough data for that comparison yet. You can still read the table. A clean sample may have no practice suggestions.

**Common substitutions** shows frequent mix-ups as **expected → typed instead**. For example, **c → x** means you typed **x** when **c** was expected.

## Explore the character table

| Control | Use it to… |
| --- | --- |
| **language** | Look at tests recorded in one Monkeytype language. |
| **layout setting** | Look at one Monkeytype layout setting. “Default” doesn’t identify your operating system’s keyboard layout. |
| **rank by** | Sort by mistake count, error rate, or attempts. |
| **min. attempts** | Hide table rows with fewer attempts. This doesn’t change the saved data or the practice-focus threshold. |
| **clear filters** | Return to all languages and layouts with the default ranking. |

Language and layout filters also affect the totals, practice focus, and common substitutions. “Latest saved test overall” always refers to the whole dataset.

For a fairer error-rate comparison, increase the minimum attempts rather than treating one mistake in a tiny sample as a pattern. Longer substitution lists can be expanded in the table.

In a narrow window, the table scrolls sideways and starts with eight rows. Use **show all characters** for the full list, or **practice focus ↓** to jump to suggestions. This layout doesn’t imply support for Chrome on phones.

## What gets recorded

Recording starts with **new, completed standard tests** after the extension connects. It works without signing in to Monkeytype and can’t import old account results.

The extension skips:

- Zen and abandoned tests.
- Funbox tests, including weakspot.
- Opposite-shift mode.
- Tests using composition/IME input, such as composing characters through an input method.
- Input it can’t count reliably, including characters such as emoji that use a different Unicode representation.

Automatic input and automatic deletions don’t count. If a test is excluded, click the collection indicator to read why.

## Where the stats belong

Stats belong to this **Chrome profile**, across Monkeytype sign-ins. If two people share the same Chrome profile, their stats are combined. Use separate Chrome profiles if you want separate records.

There’s no account sync or Chrome Sync. To move stats elsewhere, [export and restore a backup](SETUP.md#back-up-and-restore).

## Browser support

Verified on **desktop Linux Chrome**. Windows, macOS, Edge, Brave, Firefox, and mobile browsers haven’t been tested. The extension requires Chrome 111 or newer; that minimum isn’t a claim that every version has been tested.

Monkeytype’s internal test format can change. If the extension can’t read it safely, it stops recording and shows a collection notice. See [help](TROUBLESHOOTING.md) and [release checks](VERIFICATION.md) for the current limits.
