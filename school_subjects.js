/* =====================================================
   SCHOOL EXPAND V2 — more subjects + question banks.
   Adds: Literature, Spanish, Music, Art, Computer Science,
   Health, Economics, World Religions.
   Feeds window.PDX_SCHOOL_EXTRA_SUBJECTS (nav items) and
   window.PDX_SCHOOL_EXTRA_BANKS (questions), which
   school_mode.js merges into its SUBJECTS list and
   QUESTION_BANKS object.
   ===================================================== */
(function(){
"use strict";
if(window.__SCHOOL_EXPAND_V2__)return;window.__SCHOOL_EXPAND_V2__=true;

const BANKS={
  "Literature":{
    "Practice 1":[
      {q:"Who wrote 'Romeo and Juliet'?",choices:["Charles Dickens","William Shakespeare","Jane Austen","Mark Twain"],a:1,why:"Shakespeare wrote it around 1595."},
      {q:"A sonnet has how many lines?",choices:["12","14","16","18"],a:1,why:"Sonnets are 14-line poems."},
      {q:"'Call me Ishmael' opens which novel?",choices:["Moby-Dick","The Odyssey","Wuthering Heights","Treasure Island"],a:0,why:"Herman Melville's Moby-Dick (1851)."},
      {q:"A metaphor directly compares two things without using…",choices:["commas","'like' or 'as'","verbs","nouns"],a:1,why:"Similes use 'like'/'as'; metaphors don't."},
      {q:"The narrator of 'The Great Gatsby' is…",choices:["Nick Carraway","Jay Gatsby","Tom Buchanan","Daisy"],a:0,why:"Nick tells the story as an observer."},
      {q:"Iambic pentameter has how many beats per line?",choices:["5","8","10","12"],a:0,why:"'Penta' = five iambs per line."}
    ],
    "Practice 2":[
      {q:"Foreshadowing is when an author…",choices:["Hints at future events","Reveals the ending","Describes the weather","Explains the theme"],a:0,why:"Clues that suggest what's coming."},
      {q:"'To Kill a Mockingbird' is set in…",choices:["Alabama","New York","Georgia","Mississippi"],a:0,why:"Harper Lee set it in Maycomb, Alabama."},
      {q:"A dynamic character is one who…",choices:["Stays the same","Changes over the story","Is the villain","Never speaks"],a:1,why:"Dynamic = transforms through the plot."},
      {q:"Dystopian fiction imagines…",choices:["Ideal societies","Broken societies","Historical events","Animal worlds"],a:1,why:"Dystopia = nightmarish 'bad place'."},
      {q:"First-person point of view uses…",choices:["He/she/they","I/we","You","Omniscient voice"],a:1,why:"The narrator is inside the story."},
      {q:"Which is a theme, not a plot event?",choices:["The boat sinks","Love conquers fear","They escape at dawn","The king dies"],a:1,why:"Theme = the big idea underneath."}
    ],
    "Practice 3":[
      {q:"Allegory is a story where…",choices:["Animals talk","Everything symbolizes bigger ideas","The hero dies","Time moves backwards"],a:1,why:"e.g., Animal Farm = Russian Revolution."},
      {q:"Verbal irony means…",choices:["Saying the opposite of what you mean","Being rude","Foreshadowing","Rhyming"],a:0,why:"Sarcasm is a form of verbal irony."},
      {q:"George Orwell wrote…",choices:["1984","Brave New World","Fahrenheit 451","Frankenstein"],a:0,why:"Orwell's 1984 (1949)."},
      {q:"'Frankenstein' was written by…",choices:["Mary Shelley","Bram Stoker","Edgar Allan Poe","H.G. Wells"],a:0,why:"Mary Shelley, 1818, at age 20."},
      {q:"A frame story is…",choices:["A story within a story","A picture book","A trilogy","A poem"],a:0,why:"e.g., The Canterbury Tales."},
      {q:"The climax is…",choices:["The turning point of highest tension","The first chapter","The moral","The setting"]  ,a:0,why:"Where conflict peaks before resolution."}
    ],
    "Unit Test":[
      {q:"Which pair are Romantic-era poets?",choices:["Wordsworth & Coleridge","Hemingway & Steinbeck","Dickinson & Frost","Austen & Eliot"],a:0,why:"British Romantics, late 1700s–1800s."},
      {q:"In media res means the story begins…",choices:["In the middle of action","At the end","Slowly","With dialogue"],a:0,why:"Latin: 'into the middle of things'."},
      {q:"A motif differs from a theme because a motif is…",choices:["A recurring element","The moral","A character flaw","The setting"],a:0,why:"Motifs repeat as images/ideas supporting the theme."},
      {q:"Who wrote 'The Odyssey'?",choices:["Homer","Virgil","Sophocles","Plato"],a:0,why:"Ancient Greek epic attributed to Homer."},
      {q:"Free verse poetry lacks…",choices:["Fixed meter or rhyme","Emotion","Stanzas","Words"],a:0,why:"It follows no strict form."},
      {q:"'Pride and Prejudice' centers on…",choices:["Elizabeth Bennet & Mr. Darcy","Jane Eyre & Rochester","Emma & Knightley","Anne & Wentworth"],a:0,why:"Jane Austen, 1813."}
    ]
  },
  "Spanish":{
    "Practice 1":[
      {q:"\"Hola\" means…",choices:["Goodbye","Hello","Please","Thanks"],a:1,why:"Basic greeting."},
      {q:"\"Gracias\" means…",choices:["Please","Sorry","Thank you","Good morning"],a:2,why:"Gracias = thanks."},
      {q:"How do you say 'my name is'?",choices:["Me llamo","Tengo","Estoy","Voy a"],a:0,why:"Me llamo = I call myself."},
      {q:"\"Rojo\" is the color…",choices:["Blue","Green","Red","Yellow"],a:2,why:"Rojo = red."},
      {q:"\"¿Cómo estás?\" asks…",choices:["Where are you?","How are you?","Who are you?","What is this?"],a:1,why:"Cómo = how."},
      {q:"Count: uno, dos, …",choices:["cuatro","tres","cinco","seis"],a:1,why:"1, 2, 3 — tres."}
    ],
    "Practice 2":[
      {q:"\"La biblioteca\" is…",choices:["The bakery","The library","The beach","The kitchen"],a:1,why:"Biblioteca = library."},
      {q:"Conjugate 'hablar' for yo (present):",choices:["hablo","hablas","habla","hablamos"],a:0,why:"-ar verbs: yo → -o."},
      {q:"\"Ayer\" means…",choices:["Today","Tomorrow","Yesterday","Tonight"],a:2,why:"Ayer = yesterday (past)."},
      {q:"\"El gato\" is…",choices:["The dog","The cat","The horse","The bird"],a:1,why:"Gato = cat."},
      {q:"Ser vs estar: pick the correct one — 'Yo ___ feliz.'",choices:["soy","estoy","es","estás"],a:1,why:"Temporary states use estar."},
      {q:"\"Tengo hambre\" means…",choices:["I'm thirsty","I'm hungry","I'm tired","I'm cold"],a:1,why:"Hambre = hunger."}
    ],
    "Practice 3":[
      {q:"\"Vamos a la playa\" means…",choices:["Let's go to the beach","We are home","It's raining","Close the door"],a:0,why:"Playa = beach."},
      {q:"The preterite of 'comer' (yo):",choices:["comí","como","comía","comeré"],a:0,why:"Preterite = completed past action."},
      {q:"\"Hace frío\" means…",choices:["It's hot","It's cold","It's windy","It's late"],a:1,why:"Frío = cold."},
      {q:"Family: \"mi hermana\" is…",choices:["My brother","My sister","My aunt","My cousin"],a:1,why:"Hermana = sister (feminine)."},
      {q:"\"Nunca\" means…",choices:["Always","Never","Sometimes","Soon"],a:1,why:"Nunca = never."},
      {q:"Formal 'you' in Spanish is…",choices:["tú","usted","vosotros","yo"],a:1,why:"Usted = formal/respectful."}
    ],
    "Unit Test":[
      {q:"Subjunctive is used to express…",choices:["Facts","Doubt/wishes/emotions","Past tense","Commands"],a:1,why:"e.g., 'Espero que él venga.'"},
      {q:"\"Me gusta bailar\" means…",choices:["I like to dance","I hate dancing","I danced","I will dance"],a:0,why:"Gustar + infinitive."},
      {q:"Direct object pronoun for 'lo' replaces…",choices:["A masculine thing","A woman","A place","A question"],a:0,why:"lo = him/it (masc.)."},
      {q:"\"Si tuviera dinero, viajaría\" is…",choices:["Present","Conditional/hypothetical","Command","Future"],a:1,why:"If I had money, I would travel."},
      {q:"Numbers: \"treinta y cinco\" is…",choices:["25","35","45","53"],a:1,why:"30 (treinta) + 5 = 35."},
      {q:"\"¿Qué hora es?\" asks…",choices:["What time is it?","How old are you?","Where is it?","What is that?"],a:0,why:"Hora = hour/time."}
    ]
  },
  "Computer Science":{
    "Practice 1":[
      {q:"What does CPU stand for?",choices:["Central Processing Unit","Computer Power Unit","Core Program Utility","Central Print Unit"],a:0,why:"The CPU executes instructions."},
      {q:"A binary digit is called a…",choices:["bit","byte","nibble","pixel"],a:0,why:"Bit = binary digit; 8 bits = 1 byte."},
      {q:"Which is an input device?",choices:["Monitor","Keyboard","Speaker","Printer"],a:1,why:"Keyboard sends data IN."},
      {q:"HTML is used to…",choices:["Style pages","Structure web pages","Query databases","Compile code"],a:1,why:"HTML = structure; CSS = style."},
      {q:"A loop that runs forever is called…",choices:["A cycle","An infinite loop","A recursion","A thread"],a:1,why:"Never terminates — usually a bug."},
      {q:"1024 megabytes equals…",choices:["1 gigabyte","1 terabyte","1 kilobyte","8 bytes"],a:0,why:"1024 MB = 1 GB."}
    ],
    "Practice 2":[
      {q:"What does 'if/else' do?",choices:["Repeats code","Chooses between two paths","Stores data","Prints output"],a:1,why:"Conditional branching."},
      {q:"An array is…",choices:["A single number","An ordered list of values","A type of loop","A bug"],a:1,why:"Indexed collection of items."},
      {q:"CSS controls…",choices:["Structure","Styling/appearance","Server logic","Databases"],a:1,why:"Colors, fonts, layout."},
      {q:"Which is a programming language?",choices:["HTTP","Python","USB","PNG"],a:1,why:"Python, JS, Java, C++ etc."},
      {q:"Debugging means…",choices:["Writing code","Finding and fixing errors","Deleting files","Saving data"],a:1,why:"De-bugging = removing errors."},
      {q:"RAM is…",choices:["Permanent storage","Temporary working memory","A CPU part","A screen type"],a:1,why:"RAM clears when power is off."}
    ],
    "Practice 3":[
      {q:"A function is…",choices:["A reusable block of code","A type of variable","A hardware part","An error"],a:0,why:"Define once, call many times."},
      {q:"Algorithm means…",choices:["A step-by-step procedure","A bug","A language","A device"],a:0,why:"Recipes for computers."},
      {q:"Big-O describes…",choices:["Code length","Algorithm efficiency","File size","Screen size"],a:1,why:"How runtime grows with input."},
      {q:"Recursion is when a function…",choices:["Calls itself","Never ends","Runs twice","Uses no memory"],a:0,why:"Needs a base case to stop."},
      {q:"JavaScript runs mainly in…",choices:["Browsers","Refrigerators","Printers","Monitors"],a:0,why:"And servers via Node.js."},
      {q:"Open source means…",choices:["Code is public","It's free forever","No bugs","Windows only"],a:0,why:"Anyone can view/contribute."}
    ],
    "Unit Test":[
      {q:"Binary 1010 equals which decimal?",choices:["8","10","12","5"],a:1,why:"8+0+2+0 = 10."},
      {q:"HTTP status 404 means…",choices:["Server error","Not found","Success","Redirect"],a:1,why:"Resource doesn't exist."},
      {q:"Encapsulation is…",choices:["Hiding internal details","Fast loops","Copying code","Deleting data"],a:0,why:"OOP principle: bundle + hide."},
      {q:"Git is used for…",choices:["Version control","Making games","Browsing web","Printing"],a:0,why:"Tracks changes to code."},
      {q:"An IP address…",choices:["Identifies a device on a network","Is a password","Is a file type","Is a bug"],a:0,why:"Like a mailing address for devices."},
      {q:"Machine language consists of…",choices:["Binary instructions","English words","Pictures","Sounds"],a:0,why:"1s and 0s the CPU executes."}
    ]
  },
  "Health":{
    "Practice 1":[
      {q:"How many hours of sleep do teens need?",choices:["5–6","7–8","8–10","11–13"],a:2,why:"8–10 hours supports growth and focus."},
      {q:"Which nutrient builds and repairs muscles?",choices:["Protein","Sugar","Fat","Vitamin C"],a:0,why:"Protein = building blocks."},
      {q:"The heart is part of which system?",choices:["Nervous","Circulatory","Digestive","Skeletal"],a:1,why:"It pumps blood through the body."},
      {q:"Washing hands prevents…",choices:["Good mood","Spread of germs","Strong bones","Growth"],a:1,why:"20 seconds with soap."},
      {q:"Which is a healthy snack?",choices:["Candy bar","Apple with peanut butter","Chips","Soda"],a:1,why:"Fiber + protein = steady energy."},
      {q:"Exercise is recommended…",choices:["Once a month","60 min most days","Never","Only in summer"],a:1,why:"60 minutes daily for teens."}
    ],
    "Practice 2":[
      {q:"The food group giving quick energy is…",choices:["Carbohydrates","Fats","Proteins","Water"],a:0,why:"Carbs are the body's fuel."},
      {q:"Hydration means…",choices:["Getting enough water","Eating salt","Sleeping","Stretching"],a:0,why:"Water powers every cell."},
      {q:"A concussion is…",choices:["A bruise","A brain injury","A broken bone","A rash"],a:1,why:"Rest and medical care needed."},
      {q:"Stress management includes…",choices:["Deep breathing","Skipping meals","Staying up late","Ignoring feelings"],a:0,why:"Also exercise and talking it out."},
      {q:"Vaccines…",choices:["Train the immune system","Cure colds instantly","Are only for adults","Cause illness"],a:0,why:"They teach your body to fight disease."},
      {q:"Bones store…",choices:["Calcium","Oxygen","Sugar","Protein"],a:0,why:"Also make blood cells."}
    ],
    "Practice 3":[
      {q:"Mental health includes…",choices:["Emotional well-being","Only physical fitness","Diet only","Looks"],a:0,why:"Mental + emotional + social health."},
      {q:"First aid for a minor burn:",choices:["Cool running water","Ice directly","Butter","Tight bandage"],a:0,why:"Cool water 10–20 minutes."},
      {q:"Aerobic exercise strengthens…",choices:["The heart and lungs","Only arms","Eyes","Teeth"],a:0,why:"Running, swimming, cycling."},
      {q:"Peer pressure is…",choices:["Influence from friends","A disease","A food group","Exercise type"],a:0,why:"Learning to say no matters."},
      {q:"The immune system…",choices:["Fights infection","Digests food","Pumps blood","Controls mood only"],a:0,why:"White blood cells are its soldiers."},
      {q:"Sunscreen protects against…",choices:["UV damage","Rain","Cold","Noise"],a:0,why:"SPF 30+, reapply every 2 hours."}
    ],
    "Unit Test":[
      {q:"BMI measures…",choices:["Body mass index","Bone mass intake","Blood mobile index","Basic muscle info"],a:0,why:"Weight-to-height ratio estimate."},
      {q:"Calories are…",choices:["Energy units","Weight","Vitamins","Muscles"],a:0,why:"Food energy measurement."},
      {q:"Long-term stress can…",choices:["Weaken immunity","Improve sleep","Build muscle","Sharpen vision"],a:0,why:"Chronic stress harms the body."},
      {q:"CPR stands for…",choices:["Cardiopulmonary resuscitation","Chest pulse rate","Cold press remedy","Care plan report"],a:0,why:"Emergency life-support technique."},
      {q:"Which is a sign of dehydration?",choices:["Dark urine","More energy","Clear skin","Better focus"],a:0,why:"Also dizziness and dry mouth."},
      {q:"Refusal skills help you…",choices:["Say no to risky choices","Win arguments","Run faster","Memorize"],a:0,why:"Confidence to protect yourself."}
    ]
  },
  "Economics":{
    "Practice 1":[
      {q:"Scarcity means…",choices:["Unlimited resources","Limited resources vs unlimited wants","Free stuff","High prices"],a:1,why:"The core economic problem."},
      {q:"Opportunity cost is…",choices:["The next best thing given up","Money spent","A tax","A discount"],a:0,why:"Every choice has a trade-off."},
      {q:"Supply is…",choices:["How much people buy","How much sellers offer","A tax rate","A loan"],a:1,why:"Demand is how much buyers want."},
      {q:"When demand rises and supply is fixed, price…",choices:["Falls","Rises","Stays same","Doubles always"],a:1,why:"Scarcity pushes prices up."},
      {q:"GDP measures…",choices:["A country's total output","Population","Debt","Exports only"],a:0,why:"Gross Domestic Product."},
      {q:"Profit equals…",choices:["Revenue − costs","Revenue + costs","Costs − revenue","Sales tax"],a:0,why:"What's left after expenses."}
    ],
    "Practice 2":[
      {q:"Inflation means…",choices:["Prices rise over time","Prices fall","Money grows on trees","Wages freeze"],a:0,why:"Each dollar buys less."},
      {q:"A monopoly is…",choices:["One seller dominates","Many sellers","A board game only","A tax type"],a:0,why:"Little/no competition."},
      {q:"Interest is…",choices:["The cost of borrowing money","A tax refund","A wage","A fine"],a:0,why:"Lenders charge it as a percentage."},
      {q:"A budget helps you…",choices:["Plan income vs spending","Borrow more","Ignore bills","Avoid saving"],a:0,why:"Track where money goes."},
      {q:"Entrepreneur means…",choices:["Someone who starts a business","A bank teller","A customer","A landlord"],a:0,why:"Takes risk to create value."},
      {q:"Taxes fund…",choices:["Public services","Private vacations","Company profits","Nothing"],a:0,why:"Roads, schools, emergency services."}
    ],
    "Practice 3":[
      {q:"Recession is…",choices:["Economy shrinks for months","Economy booms","Prices drop forever","Full employment"],a:0,why:"Two+ quarters of negative GDP."},
      {q:"Stock represents…",choices:["Ownership in a company","A loan to a friend","A coupon","Debt only"],a:0,why:"Shareholders own a slice."},
      {q:"Comparative advantage means…",choices:["Producing at lower opportunity cost","Being biggest","Owning more oil","Charging more"],a:0,why:"Basis for beneficial trade."},
      {q:"The Federal Reserve…",choices:["Manages US money supply","Makes laws","Sells cars","Collects garbage"],a:0,why:"Central bank: rates, inflation."},
      {q:"Gross pay vs net pay:",choices:["Net = after deductions","Net = before taxes","Same thing","Gross = take-home"],a:0,why:"Taxes/insurance come out first."},
      {q:"Diversification means…",choices:["Spreading investments","Putting all in one stock","Only cash","Borrowing heavily"],a:0,why:"Reduces risk."}
    ],
    "Unit Test":[
      {q:"Demand curve slopes…",choices:["Downward","Upward","Flat","Vertical"],a:0,why:"Lower prices → more quantity demanded."},
      {q:"Fiscal policy uses…",choices:["Government spending & taxes","Interest rates","Printing only","Trade bans"],a:0,why:"Monetary policy uses rates."},
      {q:"Elastic demand means…",choices:["Buyers react strongly to price","Buyers ignore price","Fixed demand","Luxury only"],a:0,why:"e.g., gas is inelastic; candy elastic."},
      {q:"A tariff is…",choices:["A tax on imports","A subsidy","A wage","A stock type"],a:0,why:"Protects local industries."},
      {q:"Compound interest…",choices:["Grows on previous interest","Is simple only","Never grows","Is illegal"],a:0,why:"Einstein allegedly called it the 8th wonder."},
      {q:"Resources are 'allocated' by…",choices:["Markets and/or governments","Weather","Luck only","Nobody"],a:0,why:"Different systems answer scarcity differently."}
    ]
  },
  "Music":{
    "Practice 1":[
      {q:"How many lines does a staff have?",choices:["4","5","6","7"],a:1,why:"Five lines, four spaces."},
      {q:"A quarter note gets…",choices:["1 beat","2 beats","4 beats","1/2 beat"],a:0,why:"Half note = 2, whole = 4."},
      {q:"The treble clef is also called the…",choices:["G clef","F clef","C clef","Bass clef"],a:0,why:"Its curl wraps the G line."},
      {q:"How many strings does a standard guitar have?",choices:["4","5","6","7"],a:2,why:"E-A-D-G-B-E."},
      {q:"'Piano' in sheet music means…",choices:["Play loudly","Play softly","Play fast","Stop"],a:1,why:"Piano (p) = soft; forte = loud."},
      {q:"A scale is…",choices:["A series of notes in order","A drum","An instrument family","A tempo"],a:0,why:"e.g., C major: C-D-E-F-G-A-B-C."}
    ],
    "Practice 2":[
      {q:"Tempo means…",choices:["Speed of the music","Volume","Key","Rhythm pattern"],a:0,why:"Allegro = fast; largo = slow."},
      {q:"A sharp (#)…",choices:["Raises the note a half step","Lowers the note","Silences the note","Doubles the note"],a:0,why:"Flat (b) lowers it."},
      {q:"The 4/4 time signature means…",choices:["4 beats per measure","4 measures","Fast tempo","Loud volume"],a:0,why:"Quarter note = 1 beat."},
      {q:"Which instrument is a woodwind?",choices:["Flute","Trumpet","Violin","Timpani"],a:0,why:"Also clarinet, oboe, bassoon."},
      {q:"A chord is…",choices:["Three or more notes together","One note","A drumbeat","A rest"],a:0,why:"Major/minor triads are common."},
      {q:"Beethoven composed…",choices:["Symphony No. 5","The Four Seasons","The Messiah","Swan Lake"],a:0,why:"Da-da-da-DUM — famous motif."}
    ],
    "Practice 3":[
      {q:"Melody is…",choices:["The main tune","The background beat","The lyrics","The volume"],a:0,why:"The part you hum."},
      {q:"Harmony provides…",choices:["Supporting notes behind the melody","Drums only","Silence","Tempo"],a:0,why:"Chords + counterpoint."},
      {q:"A key change mid-song is called…",choices:["Modulation","Syncopation","Crescendo","Fermata"],a:0,why:"Common in pop and musicals."},
      {q:"Syncopation shifts accent to…",choices:["Off-beats","Downbeats","The end","The middle only"],a:0,why:"Gives jazz its swing."},
      {q:"Dynamics markings range from…",choices:["pp to ff","A to G","1 to 10","Loud only"],a:0,why:"Pianissimo → fortissimo."},
      {q:"A cadence is…",choices:["A musical ending phrase","An instrument","A note name","A drum solo"],a:0,why:"Like punctuation in speech."}
    ],
    "Unit Test":[
      {q:"The Circle of Fifths shows…",choices:["Key relationships","Note lengths","Rhythm patterns","Instrument ranges"],a:0,why:"Each step = a fifth apart."},
      {q:"Sonata form has…",choices:["Exposition, development, recapitulation","Verse only","One theme","No structure"],a:0,why:"Classic classical-era structure."},
      {q:"Counterpoint is…",choices:["Independent melodies woven together","One melody","Drum pattern","A tempo change"],a:0,why:"Bach was the master."},
      {q:"Vibrato is…",choices:["A pitch wobble for expression","A key","An instrument","A rest"],a:0,why:"Used on strings and voice."},
      {q:"The 'baroque' period spanned roughly…",choices:["1600–1750","1800–1900","1950–2000","1000–1100"],a:0,why:"Bach, Handel, Vivaldi."},
      {q:"A motif is…",choices:["A short recurring musical idea","A whole symphony","A key signature","An encore"],a:0,why:"Beethoven's 5th opens with one."}
    ]
  }
};

window.PDX_SCHOOL_EXTRA_SUBJECTS=Object.keys(BANKS);
window.PDX_SCHOOL_EXTRA_BANKS=BANKS;
// merge into school_mode's QUESTION_BANKS if exposed
console.log("[SchoolExpandV2] Extra subjects ready:",window.PDX_SCHOOL_EXTRA_SUBJECTS.join(", "));
})();
