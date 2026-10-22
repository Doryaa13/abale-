# Fact-check and medical-safety review: weeks 3–22

File reviewed and fixed in place: `weeks_03-22.json`. I read every week sentence by sentence: partnerStatus.text, tags, babyStatus.text, and every task text and description.

Validation output: `20 true`. Task counts per category match ORIGINAL_weeks.json. Category names and order are unchanged, and so are week, trimester, month and keys. Every week has 2–3 tags. The JSON is valid and keeps the original 1-space indentation. The pre-review copy is saved at `../verify_scripts/weeks_03-22.before.json`.

## 1. Changes made

| Week / field | Before | After | Reason | Source |
|---|---|---|---|---|
| 8 babySize.weight | 1.2 גרם | 1 גרם | Aligned with the single cited weight series (see section 2) | https://embryology.med.unsw.edu.au/embryology/index.php/Category:Week_16 |
| 11 babySize.weight | 45 גרם | 7 גרם | 45 g is the Hadlock formula extrapolated below its sensible range. Anatomical data gives about 7–8 g | UNSW table (7 g). Mayo, via the licensed mirror (about 8 g, CRL 50 mm): https://www.mhsystem.org/health-library/art-20045302 |
| 12 babySize.weight | 58 גרם | 14 גרם | Same reason | UNSW (14 g). Mayo, mirror (about 14 g, CRL 61 mm) |
| 13 babySize.weight | 73 גרם | 23 גרם | Same reason | UNSW (23 g). HSE week 13: "weighs around 25g": https://www2.hse.ie/pregnancy-birth/baby-development-pregnancy-stages/stages/13-16-weeks |
| 4 babyStatus | "כרגע הוא קטנטן, פחות ממילימטר." | "כרגע הוא זעיר, בגודל של מילימטרים בודדים לכל היותר." | Cleveland Clinic puts the conceptus at about 2 mm by the end of week 4, so "less than a millimetre" was wrong. Also consistent with week 5 ("מילימטר או שניים") | https://my.clevelandclinic.org/health/articles/7247-fetal-development-stages-of-growth |
| 6 task (תמיכה 3) | "...כשהבטן מתהפכת (תה, ג'ינג'ר, משהו חמוץ) ותחזיק מלאי" | Parenthetical examples removed | Ginger and sour foods read as a nausea remedy suggestion. The task still asks her what helps | Style guide, hard rule 2 |
| 7 task (תמיכה 1) | "היא קמה הרבה בלילה לשירותים." | "אם היא קמה הרבה בלילה לשירותים, ..." | Overgeneralisation, now conditional | — |
| 9 task (תמיכה 2) | "הרבה נשים מעדיפות עכשיו דברים קרים" | "יש נשים שמעדיפות..." | Unverified prevalence claim, now hedged | — |
| 11 babyStatus | "...והברכיים, המרפקים והקרסוליים עובדים." | "...ומזיז ידיים ורגליים." | No source states that the joints "work" at week 11. Opening and closing the fists, and limb movements, are documented | Cleveland week 11 (opens and closes fists) |
| 12 partnerStatus | "בליטה קטנה, בעיקר בשעות הבוקר" | "בליטה קטנה" | The "mornings" detail is unsupported, and bloating usually makes the belly look bigger later in the day, not in the morning | — |
| 13 tag | "הבטן מתחילה להורגש" | "הבטן מתחילה להיות מורגשת" | "להורגש" is not a valid Hebrew form | — |
| 15 babyStatus | "הרגליים מתארכות ומשיגות את הזרועות" | "הרגליים מתארכות" | "Legs overtake arms" appears only in commercial sources (SMA, Nestlé). I could not confirm it in NHS, Mayo, Cleveland or HSE | — |
| 17 babyStatus | "מתחת לעור שלו מתחיל להצטבר שומן, כולל 'שומן חום'..." | "בשבועות האלה מתחיל להצטבר מתחת לעור שלו שומן ראשון, ובהמשך גם 'שומן חום'..." | Mayo puts brown fat at week 22, so at week 17 it is now "later" | Mayo 2nd trimester (Koç University mirror): https://www.kuh.ku.edu.tr/mayo-clinic-care-network/mayo-clinic-health-information-library/first-aid/fetal-development-the-2nd-trimester |
| 17 task (מוראל 3) | "תהנה" | "תיהנה" | Spelling | — |
| 18 task (תמיכה 1) | "ותעזור במתיחה עדינה רק אם היא רוצה" | "ותעזור במה שהיא מבקשת" | Stretching a leg cramp is a treatment instruction | Style guide, hard rule 2 |
| 18 partnerStatus | (mild end-of-day swelling, no warning) | Added "נפיחות שמופיעה פתאום, בעיקר בפנים או בידיים? מתקשרים לרופא." | A real warning sign. NHS lists sudden swelling of the face, hands or feet as urgent. Uses the generic "call the doctor" only, and matches the wording already used in weeks 23–42 | https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/swollen-ankles-feet-and-fingers/ |
| 19 partnerStatus | "העור על הבטן נמתח ועשוי לגרד." | Added "גירוד חזק או מטריד? מתקשרים לרופא או למיילדת." | NHS says to contact the midwife or GP about itching, and to get urgent help for intense or new itching (possible ICP). The text mentions itching, so the generic warning is relevant | https://www.nhs.uk/pregnancy/related-conditions/complications/itching-and-intrahepatic-cholestasis/ |
| 19 task (מוראל 1) | "תהנו" | "תיהנו" | Spelling | — |
| 20 partnerStatus | "...ויכול לגרד, ויש נשים שהפופיק..." | "...ויכול לגרד, ואם הגירוד חזק או מטריד, מתקשרים לרופא. יש נשים שהפופיק..." | Same reason as week 19 | NHS (as above) |
| 21 partnerStatus | (mild swelling in hands and feet, no warning) | Added the same sudden-swelling sentence as week 18 | NHS, and consistent with weeks 23–42 | NHS swelling page |
| 21 task (מוראל 2) | "הקול שלה הוא כנראה הצליל שמגיע אליו הכי הרבה" | "...הקול שהוא שומע הכי הרבה" | Accuracy: her heartbeat and body sounds reach him more than her voice does. Her voice is the voice he hears most | Cleveland week 22 (hears heartbeat, stomach, breathing) |

babySize.object: no changes. Week 12 (Zippo, about 57 g) and week 13 (spark plug, about 40–60 g) are heavier than the corrected weights. Their length matches the baby well, though (about 5.5 cm vs CRL 5.4–6.1 cm, and about 8 cm vs 7.4 cm), and the guide allows "weight/size". All other objects look roughly right.

## 2. Weight decision for weeks 3–13

**Approach:** one anatomical (autopsy-based) reference series for weeks 8–13: the UNSW Embryology table (sources: Cussen 1990, Hansen 2003, Archie 2006). Two independent sources cross-check it: Mayo Clinic gives about 8 g at week 11 and about 14 g at week 12, and HSE Ireland gives about 25 g at week 13.

| Week | Old | New | UNSW (g) | Cross-check |
|---|---|---|---|---|
| 3–7 | פחות מגרם | פחות מגרם (unchanged) | — | Embryo is a few mm to about 1 cm |
| 8 | 1.2 גרם | **1 גרם** | 1 | — |
| 9 | 2 גרם | 2 גרם (unchanged) | 2 | — |
| 10 | 4 גרם | 4 גרם (unchanged) | 4 | — |
| 11 | 45 גרם | **7 גרם** | 7 | Mayo about 8 g |
| 12 | 58 גרם | **14 גרם** | 14 | Mayo about 14 g |
| 13 | 73 גרם | **23 גרם** | 23 | HSE about 25 g |
| 14 | 93 גרם | 93 (Hadlock, not touched) | 43 | Mayo about 45 g |

**Why the old values were wrong:** the old 45/58/73 g values for weeks 11–13 are the early end of the same Hadlock in-utero table used for weeks 14–40. That table lists 10 w = 35 g, 11 = 45, 12 = 58, 13 = 73 and 14 = 93, and matches ln(EFW) = 0.578 + 0.332·GA − 0.00354·GA². Copied as is by sites such as Vinmec and Hi Mommy, the table even yields about 20 g at week 8, which is physically impossible for a 1.1–1.4 cm embryo. In the first trimester this sonographic formula overestimates by a factor of 3–6 against measured weights. So it is a poor fit there, even though it keeps the series continuous with week 14.

**Remaining jump:** the series is now monotonic: <1, …, 1, 2, 4, 7, 14, 23, 93, 117, … The 13 → 14 jump (23 → 93 g) is unavoidable while weeks 14+ stay on Hadlock. Hadlock's 93 g at week 14 is itself above anatomical data (about 43–45 g). Per the brief, I chose values that are each individually well sourced rather than inventing a bridge. If a smooth curve matters more than matching Hadlock from week 14, the cleanest option is to use UNSW/Mayo until about week 16–18 and Hadlock after that. That decision is outside my brief.

## 3. Claims checked and confirmed (kept)

| Week | Claim | Source |
|---|---|---|
| 3 | Fertilisation; zygote divides; implantation around the end of week 3 / week 4 | Mayo (mirror) weeks 3–4; Cleveland week 3 |
| 4 | Outer cells form the placenta; inner cells form the embryo; hCG | Mayo week 4–5 |
| 4 | Home test can be positive around the missed period | Standard (NHS doing a pregnancy test) |
| 4 task | First ultrasound around weeks 6–7 | Maccabi: https://www.maccabi4u.co.il/maccabi_circles/pregnancy-and-birth/pregnancy_birth/tests/ |
| 5 | Three germ layers and what each forms; heart tube may begin to beat by the end of the week | Mayo week 5; Cleveland week 5 (heart tube pulses by end of week 5) |
| 6 | Neural tube closes; heart beats; arm buds; eye and ear structures; heartbeat may be seen on TVUS | Mayo week 6; Cleveland week 6 |
| 7 | Nostril depressions, retinas, paddle arms, leg buds | Mayo week 7 |
| 8 | CRL 11–14 mm ("about 1.5 cm"); nose, upper lip, fingers forming; outer ear swellings | Mayo week 8 |
| 9 | Elbows, toes, eyelids; about 2 cm (Mayo 16–18 mm; UNSW 2.3 cm) | Mayo week 9; UNSW |
| 9 task | Nuchal scan at weeks 11–13 (+6) | Israeli sources (search summary); Maccabi |
| 9, 11 tasks | NIPT usually done privately, partly reimbursed by supplementary insurance | hamichlol / kamaze summaries (not in the basket) |
| 10 | Elbows bend; webbing lost; nails begin; genitals begin but not visible | Mayo week 10; Cleveland week 10 (nails) |
| 10 / 11 | Embryonic period ends; called a fetus from week 11 | Mayo week 11 |
| 10, 11 tasks | Early anatomy scan at weeks 14–17 | Maccabi early scan page ("בשבועות 14 עד 17"): https://www.maccabi4u.co.il/maccabi_circles/pregnancy-and-birth/pregnancy_birth/tests/first-anatomy-scan/ |
| 11 | About 5 cm; eyelids fused; tooth buds; outer genitals developing; opens and closes fists | Mayo week 11; Cleveland week 11 |
| 12 | About 6 cm; intestines in the abdomen; nails forming; swallows and produces urine | Mayo week 12; Cleveland week 12; Mayo week 13 |
| 13 | Bones harden; skin thin; head growth slows | Mayo 2nd trimester week 13 |
| 13 | Fingerprint patterns begin forming (hedged "בשלב הזה מתחילים") | Cleveland week 14 |
| 13, 16 tasks | Triple test / AFP at weeks 16–19 | Maccabi tests page |
| 14 | About 8–9 cm (Mayo 87 mm); neck more defined; sex identifiable in most cases at the early scan; hands to mouth | Mayo week 14; Maccabi early scan page ("ברוב המקרים ניתן לזהות גם את מין העובר"); Cleveland week 14 |
| 15 | Lanugo starting; thumb sucking; sensitive to light | Cleveland weeks 14–15; HSE week 15 (eyes become sensitive to light) |
| 16 | Eyes move slowly; head upright; responds to light; hearing starts in the coming weeks | Mayo week 16; Cleveland week 16 |
| 16 | Most women feel first movements between weeks 16 and 24, later in a first pregnancy | NHS (via the writer's NI mirror); HSE 17–20 |
| 16, 22 tasks | Late anatomy scan at weeks 21–24 | Maccabi tests page |
| 17 | Vernix begins | Cleveland week 17 (Mayo week 19) |
| 17 | Heartburn from hormones relaxing the oesophageal valve | Standard physiology |
| 17 task | Amniocentesis at weeks 16–20 if recommended | Maccabi tests page |
| 18 | Hearing begins around now; middle-ear bones ossify; lanugo covers the body | Mayo week 18; Cleveland week 18; KidsHealth week 18 |
| 18 | Activity and rest periods | Cleveland week 18; HSE week 20 |
| 19 | Unique fingerprints; vernix | Cleveland week 19; Mayo week 19 |
| 20 | Uterus reaches the navel at about 20 weeks; about 25 cm head to heel; nails grow toward fingertips; testes descend later | Cleveland (9–10 in at week 20; week 20 nails); Mayo week 22 (testes begin descending) |
| 21 | Bone marrow increasingly produces blood cells; liver and spleen did so before | Cleveland week 21; Mayo weeks 11 and 14 |
| 21 | Roughly doubles in weight within about a month | Hadlock 399 g → 780 g at week 25 (the data's own table) |
| 21 task | Glucose challenge at weeks 24–28 | Maccabi: https://www.maccabi4u.co.il/healthguide/labs/oralglucosechallengetogct/ |
| 22 | Eyebrows starting; stronger grasp; hears her heartbeat, breathing and digestion | Mayo week 22; Cleveland week 22 |
| 22 → 23 | "Skin will start to fill out in the coming weeks" (22) and "skin starts to fill out slowly" (23) read consistently | weeks_23-42.json |

## 4. Still uncertain (kept, hedged)

- **Week 20, "about the length of a regular screwdriver, head to heel":** about 25 cm. Common screwdrivers are about 15–27 cm long, so this is plausible only as "בערך". It is already worded that way.
- **Hearing onset:** HSE says week 15, Cleveland week 16, Mayo week 18. The text says "in the coming weeks" at 16 and "around these weeks" at 18. That is consistent with all three.
- **Lanugo timing:** Cleveland says it begins at 14 and covers the body at 18. Mayo says it covers the body at 21. Week 15 says "starting" and week 18 says "covers". OK within the range.
- **Vernix timing:** Cleveland says 17, Mayo 19. Both weeks mention it. Acceptable.
- **Week 17, umbilical cord thickening:** I found this only in mid-tier sources (The Bump, AmericanPregnancy.org). It is plausible and harmless, so I kept it.
- **Week 18, meconium already forming:** KidsHealth and other secondary sources support it. It is not in NHS, Mayo or Cleveland.
- **Week 19, "brain areas related to the senses":** a common BabyCenter-style claim. I could not open BabyCenter to confirm it.
- **Week 20, "millions of eggs in the ovaries":** a textbook fact (the peak is around 20 weeks). I did not open a specific source for it.
- **Weeks 12 and 14, breathing-like movements on ultrasound:** documented in fetal-movement literature from about week 10. Hedged with "לפעמים".
- **Week 10, blood volume up about 40–50% by the end of pregnancy:** a commonly cited range, hedged with "בערך".
- **Week 18, blood pressure dips slightly in the second trimester:** well established, and given without numbers.
- **Weight jump from week 13 to 14 (23 → 93 g):** see section 2.
