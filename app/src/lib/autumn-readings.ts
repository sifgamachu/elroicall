// Reading assignments and companion prompts from the user's 84-Day Challenge PDF.
export type AutumnReading = { day: number; passage: string; question: string; notice: string; concept: string };
export const AUTUMN_READINGS: AutumnReading[] = [
  {
    "day": 1,
    "passage": "Genesis 1-15",
    "question": "How did God's good creation become broken, and how did His covenant promise begin?",
    "notice": "Watch for creation, fall, covenant, promise.",
    "concept": "Genesis: Beginnings and Promise."
  },
  {
    "day": 2,
    "passage": "Genesis 16-30",
    "question": "How did God's good creation become broken, and how did His covenant promise begin?",
    "notice": "Watch for creation, fall, covenant, promise.",
    "concept": "Genesis: Beginnings and Promise."
  },
  {
    "day": 3,
    "passage": "Genesis 31-45",
    "question": "How did God's good creation become broken, and how did His covenant promise begin?",
    "notice": "Watch for creation, fall, covenant, promise.",
    "concept": "Genesis: Beginnings and Promise."
  },
  {
    "day": 4,
    "passage": "Genesis 46-50; Exodus 1-10",
    "question": "How does the Bible move from beginnings and promise into rescue and covenant?",
    "notice": "Watch the transition between Genesis and Exodus. Notice creation, fall, covenant, promise.",
    "concept": "Genesis: Beginnings and Promise. Exodus: Rescue and Covenant."
  },
  {
    "day": 5,
    "passage": "Exodus 11-25",
    "question": "How does God rescue a people and form them into His covenant community?",
    "notice": "Watch for deliverance, Passover, covenant, law.",
    "concept": "Exodus: Rescue and Covenant."
  },
  {
    "day": 6,
    "passage": "Exodus 26-40",
    "question": "How does God rescue a people and form them into His covenant community?",
    "notice": "Watch for deliverance, Passover, covenant, law.",
    "concept": "Exodus: Rescue and Covenant."
  },
  {
    "day": 7,
    "passage": "Leviticus 1-15",
    "question": "How can a holy God dwell among sinful people?",
    "notice": "Watch for holiness, sacrifice, priesthood, atonement.",
    "concept": "Leviticus: Holiness and Worship."
  },
  {
    "day": 8,
    "passage": "Leviticus 16-27; Numbers 1-3",
    "question": "How does the Bible move from holiness and worship into wilderness and trust?",
    "notice": "Watch the transition between Leviticus and Numbers. Notice holiness, sacrifice, priesthood, atonement.",
    "concept": "Leviticus: Holiness and Worship. Numbers: Wilderness and Trust."
  },
  {
    "day": 9,
    "passage": "Numbers 4-18",
    "question": "What happens when God's people struggle to trust Him on the journey?",
    "notice": "Watch for testing, rebellion, provision, faithfulness.",
    "concept": "Numbers: Wilderness and Trust."
  },
  {
    "day": 10,
    "passage": "Numbers 19-33",
    "question": "What happens when God's people struggle to trust Him on the journey?",
    "notice": "Watch for testing, rebellion, provision, faithfulness.",
    "concept": "Numbers: Wilderness and Trust."
  },
  {
    "day": 11,
    "passage": "Numbers 34-36; Deuteronomy 1-12",
    "question": "How does the Bible move from wilderness and trust into remember and obey?",
    "notice": "Watch the transition between Numbers and Deuteronomy. Notice testing, rebellion, provision, faithfulness.",
    "concept": "Numbers: Wilderness and Trust. Deuteronomy: Remember and Obey."
  },
  {
    "day": 12,
    "passage": "Deuteronomy 13-27",
    "question": "What must Israel remember before entering the promised land?",
    "notice": "Watch for covenant renewal, love, obedience, remembrance.",
    "concept": "Deuteronomy: Remember and Obey."
  },
  {
    "day": 13,
    "passage": "Deuteronomy 28-34; Joshua 1-8",
    "question": "How does the Bible move from remember and obey into promise fulfilled?",
    "notice": "Watch the transition between Deuteronomy and Joshua. Notice covenant renewal, love, obedience, remembrance.",
    "concept": "Deuteronomy: Remember and Obey. Joshua: Promise Fulfilled."
  },
  {
    "day": 14,
    "passage": "Joshua 9-22",
    "question": "How does Israel enter the land God promised?",
    "notice": "Watch for courage, conquest, inheritance, covenant.",
    "concept": "Joshua: Promise Fulfilled."
  },
  {
    "day": 15,
    "passage": "Joshua 23-24; Judges 1-12",
    "question": "How does the Bible move from promise fulfilled into cycles of rebellion?",
    "notice": "Watch the transition between Joshua and Judges. Notice courage, conquest, inheritance, covenant.",
    "concept": "Joshua: Promise Fulfilled. Judges: Cycles of Rebellion."
  },
  {
    "day": 16,
    "passage": "Judges 13-21; Ruth 1-4; 1 Samuel 1",
    "question": "How does the Bible move from cycles of rebellion into from judges to kings?",
    "notice": "Watch the transition between Judges and 1 Samuel. Notice sin, oppression, deliverance, decline.",
    "concept": "Judges: Cycles of Rebellion. Ruth: Faithfulness in Ordinary Life. 1 Samuel: From Judges to Kings."
  },
  {
    "day": 17,
    "passage": "1 Samuel 2-15",
    "question": "What kind of king will God's people follow?",
    "notice": "Watch for Samuel, Saul, David, obedience.",
    "concept": "1 Samuel: From Judges to Kings."
  },
  {
    "day": 18,
    "passage": "1 Samuel 16-29",
    "question": "What kind of king will God's people follow?",
    "notice": "Watch for Samuel, Saul, David, obedience.",
    "concept": "1 Samuel: From Judges to Kings."
  },
  {
    "day": 19,
    "passage": "1 Samuel 30-31; 2 Samuel 1-12",
    "question": "How does the Bible move from from judges to kings into david's kingdom?",
    "notice": "Watch the transition between 1 Samuel and 2 Samuel. Notice Samuel, Saul, David, obedience.",
    "concept": "1 Samuel: From Judges to Kings. 2 Samuel: David's Kingdom."
  },
  {
    "day": 20,
    "passage": "2 Samuel 13-24; 1 Kings 1-2",
    "question": "How does the Bible move from david's kingdom into glory and division?",
    "notice": "Watch the transition between 2 Samuel and 1 Kings. Notice David, covenant, kingdom, sin.",
    "concept": "2 Samuel: David's Kingdom. 1 Kings: Glory and Division."
  },
  {
    "day": 21,
    "passage": "1 Kings 3-16",
    "question": "How does a prosperous kingdom become divided?",
    "notice": "Watch for Solomon, temple, idolatry, divided kingdom.",
    "concept": "1 Kings: Glory and Division."
  },
  {
    "day": 22,
    "passage": "1 Kings 17-22; 2 Kings 1-8",
    "question": "How does the Bible move from glory and division into decline and exile?",
    "notice": "Watch the transition between 1 Kings and 2 Kings. Notice Solomon, temple, idolatry, divided kingdom.",
    "concept": "1 Kings: Glory and Division. 2 Kings: Decline and Exile."
  },
  {
    "day": 23,
    "passage": "2 Kings 9-22",
    "question": "Why did Israel and Judah eventually lose the land?",
    "notice": "Watch for prophets, rebellion, judgment, exile.",
    "concept": "2 Kings: Decline and Exile."
  },
  {
    "day": 24,
    "passage": "2 Kings 23-25; 1 Chronicles 1-11",
    "question": "How does the Bible move from decline and exile into remembering david?",
    "notice": "Watch the transition between 2 Kings and 1 Chronicles. Notice prophets, rebellion, judgment, exile.",
    "concept": "2 Kings: Decline and Exile. 1 Chronicles: Remembering David."
  },
  {
    "day": 25,
    "passage": "1 Chronicles 12-25",
    "question": "How does Israel retell its story around worship and covenant hope?",
    "notice": "Watch for genealogy, David, temple, worship.",
    "concept": "1 Chronicles: Remembering David."
  },
  {
    "day": 26,
    "passage": "1 Chronicles 26-29; 2 Chronicles 1-10",
    "question": "How does the Bible move from remembering david into temple, kings, exile?",
    "notice": "Watch the transition between 1 Chronicles and 2 Chronicles. Notice genealogy, David, temple, worship.",
    "concept": "1 Chronicles: Remembering David. 2 Chronicles: Temple, Kings, Exile."
  },
  {
    "day": 27,
    "passage": "2 Chronicles 11-24",
    "question": "What does Judah's history teach about worship, reform, and judgment?",
    "notice": "Watch for temple, kings, reform, exile.",
    "concept": "2 Chronicles: Temple, Kings, Exile."
  },
  {
    "day": 28,
    "passage": "2 Chronicles 25-36; Ezra 1-2",
    "question": "How does the Bible move from temple, kings, exile into return and rebuilding?",
    "notice": "Watch the transition between 2 Chronicles and Ezra. Notice temple, kings, reform, exile.",
    "concept": "2 Chronicles: Temple, Kings, Exile. Ezra: Return and Rebuilding."
  },
  {
    "day": 29,
    "passage": "Ezra 3-10; Nehemiah 1-6",
    "question": "How does the Bible move from return and rebuilding into rebuilding a community?",
    "notice": "Watch the transition between Ezra and Nehemiah. Notice return, temple, Scripture, restoration.",
    "concept": "Ezra: Return and Rebuilding. Nehemiah: Rebuilding a Community."
  },
  {
    "day": 30,
    "passage": "Nehemiah 7-13; Esther 1-7",
    "question": "How does the Bible move from rebuilding a community into providence in hidden places?",
    "notice": "Watch the transition between Nehemiah and Esther. Notice leadership, community, covenant, renewal.",
    "concept": "Nehemiah: Rebuilding a Community. Esther: Providence in Hidden Places."
  },
  {
    "day": 31,
    "passage": "Esther 8-10; Job 1-11",
    "question": "How does the Bible move from providence in hidden places into faith in suffering?",
    "notice": "Watch the transition between Esther and Job. Notice providence, courage, reversal, preservation.",
    "concept": "Esther: Providence in Hidden Places. Job: Faith in Suffering."
  },
  {
    "day": 32,
    "passage": "Job 12-25",
    "question": "How do we trust God when suffering does not make sense?",
    "notice": "Watch for suffering, wisdom, integrity, sovereignty.",
    "concept": "Job: Faith in Suffering."
  },
  {
    "day": 33,
    "passage": "Job 26-39",
    "question": "How do we trust God when suffering does not make sense?",
    "notice": "Watch for suffering, wisdom, integrity, sovereignty.",
    "concept": "Job: Faith in Suffering."
  },
  {
    "day": 34,
    "passage": "Job 40-42; Psalms 1-11",
    "question": "How does the Bible move from faith in suffering into prayer and worship?",
    "notice": "Watch the transition between Job and Psalms. Notice suffering, wisdom, integrity, sovereignty.",
    "concept": "Job: Faith in Suffering. Psalms: Prayer and Worship."
  },
  {
    "day": 35,
    "passage": "Psalms 12-25",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 36,
    "passage": "Psalms 26-39",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 37,
    "passage": "Psalms 40-53",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 38,
    "passage": "Psalms 54-67",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 39,
    "passage": "Psalms 68-81",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 40,
    "passage": "Psalms 82-95",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 41,
    "passage": "Psalms 96-109",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 42,
    "passage": "Psalms 110-123",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 43,
    "passage": "Psalms 124-137",
    "question": "How do God's people pray through every season of life?",
    "notice": "Watch for worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship."
  },
  {
    "day": 44,
    "passage": "Psalms 138-150; Proverbs 1",
    "question": "How does the Bible move from prayer and worship into wisdom for life?",
    "notice": "Watch the transition between Psalms and Proverbs. Notice worship, lament, praise, kingship.",
    "concept": "Psalms: Prayer and Worship. Proverbs: Wisdom for Life."
  },
  {
    "day": 45,
    "passage": "Proverbs 2-15",
    "question": "What does wise, God-centered living look like day by day?",
    "notice": "Watch for wisdom, speech, work, relationships.",
    "concept": "Proverbs: Wisdom for Life."
  },
  {
    "day": 46,
    "passage": "Proverbs 16-29",
    "question": "What does wise, God-centered living look like day by day?",
    "notice": "Watch for wisdom, speech, work, relationships.",
    "concept": "Proverbs: Wisdom for Life."
  },
  {
    "day": 47,
    "passage": "Proverbs 30-31; Ecclesiastes 1-12",
    "question": "How does the Bible move from wisdom for life into meaning under the sun?",
    "notice": "Watch the transition between Proverbs and Ecclesiastes. Notice wisdom, speech, work, relationships.",
    "concept": "Proverbs: Wisdom for Life. Ecclesiastes: Meaning Under the Sun."
  },
  {
    "day": 48,
    "passage": "Song of Solomon 1-8; Isaiah 1-6",
    "question": "How does the Bible move from love and delight into judgment and hope?",
    "notice": "Watch the transition between Song of Solomon and Isaiah. Notice love, desire, commitment, beauty.",
    "concept": "Song of Solomon: Love and Delight. Isaiah: Judgment and Hope."
  },
  {
    "day": 49,
    "passage": "Isaiah 7-20",
    "question": "How can judgment and future hope belong in the same prophetic message?",
    "notice": "Watch for holiness, judgment, servant, Messiah.",
    "concept": "Isaiah: Judgment and Hope."
  },
  {
    "day": 50,
    "passage": "Isaiah 21-34",
    "question": "How can judgment and future hope belong in the same prophetic message?",
    "notice": "Watch for holiness, judgment, servant, Messiah.",
    "concept": "Isaiah: Judgment and Hope."
  },
  {
    "day": 51,
    "passage": "Isaiah 35-48",
    "question": "How can judgment and future hope belong in the same prophetic message?",
    "notice": "Watch for holiness, judgment, servant, Messiah.",
    "concept": "Isaiah: Judgment and Hope."
  },
  {
    "day": 52,
    "passage": "Isaiah 49-62",
    "question": "How can judgment and future hope belong in the same prophetic message?",
    "notice": "Watch for holiness, judgment, servant, Messiah.",
    "concept": "Isaiah: Judgment and Hope."
  },
  {
    "day": 53,
    "passage": "Isaiah 63-66; Jeremiah 1-10",
    "question": "How does the Bible move from judgment and hope into warning and new covenant?",
    "notice": "Watch the transition between Isaiah and Jeremiah. Notice holiness, judgment, servant, Messiah.",
    "concept": "Isaiah: Judgment and Hope. Jeremiah: Warning and New Covenant."
  },
  {
    "day": 54,
    "passage": "Jeremiah 11-24",
    "question": "What hope remains when a nation refuses to turn back?",
    "notice": "Watch for judgment, exile, new covenant, faithfulness.",
    "concept": "Jeremiah: Warning and New Covenant."
  },
  {
    "day": 55,
    "passage": "Jeremiah 25-38",
    "question": "What hope remains when a nation refuses to turn back?",
    "notice": "Watch for judgment, exile, new covenant, faithfulness.",
    "concept": "Jeremiah: Warning and New Covenant."
  },
  {
    "day": 56,
    "passage": "Jeremiah 39-52",
    "question": "What hope remains when a nation refuses to turn back?",
    "notice": "Watch for judgment, exile, new covenant, faithfulness.",
    "concept": "Jeremiah: Warning and New Covenant."
  },
  {
    "day": 57,
    "passage": "Lamentations 1-5; Ezekiel 1-9",
    "question": "How does the Bible move from grief with hope into god's glory and restoration?",
    "notice": "Watch the transition between Lamentations and Ezekiel. Notice lament, grief, judgment, mercy.",
    "concept": "Lamentations: Grief with Hope. Ezekiel: God's Glory and Restoration."
  },
  {
    "day": 58,
    "passage": "Ezekiel 10-23",
    "question": "How will God restore a people whose hearts have become hard?",
    "notice": "Watch for glory, judgment, new heart, restoration.",
    "concept": "Ezekiel: God's Glory and Restoration."
  },
  {
    "day": 59,
    "passage": "Ezekiel 24-37",
    "question": "How will God restore a people whose hearts have become hard?",
    "notice": "Watch for glory, judgment, new heart, restoration.",
    "concept": "Ezekiel: God's Glory and Restoration."
  },
  {
    "day": 60,
    "passage": "Ezekiel 38-48; Daniel 1-3",
    "question": "How does the Bible move from god's glory and restoration into faithfulness in exile?",
    "notice": "Watch the transition between Ezekiel and Daniel. Notice glory, judgment, new heart, restoration.",
    "concept": "Ezekiel: God's Glory and Restoration. Daniel: Faithfulness in Exile."
  },
  {
    "day": 61,
    "passage": "Daniel 4-12; Hosea 1-5",
    "question": "How does the Bible move from faithfulness in exile into faithful love?",
    "notice": "Watch the transition between Daniel and Hosea. Notice exile, kingdoms, faithfulness, sovereignty.",
    "concept": "Daniel: Faithfulness in Exile. Hosea: Faithful Love."
  },
  {
    "day": 62,
    "passage": "Hosea 6-14; Joel 1-3; Amos 1-2",
    "question": "How does the Bible move from faithful love into justice and true worship?",
    "notice": "Watch the transition between Hosea and Amos. Notice covenant, unfaithfulness, mercy, restoration.",
    "concept": "Hosea: Faithful Love. Joel: The Day of the Lord. Amos: Justice and True Worship."
  },
  {
    "day": 63,
    "passage": "Amos 3-9; Obadiah 1; Jonah 1-4; Micah 1-2",
    "question": "How does the Bible move from justice and true worship into justice, mercy, messiah?",
    "notice": "Watch the transition between Amos and Micah. Notice justice, righteousness, judgment, restoration.",
    "concept": "Amos: Justice and True Worship. Obadiah: Pride Brought Low. Jonah: Mercy for the Nations. Micah: Justice, Mercy, Messiah."
  },
  {
    "day": 64,
    "passage": "Micah 3-7; Nahum 1-3; Habakkuk 1-3; Zephaniah 1-3",
    "question": "How does the Bible move from justice, mercy, messiah into judgment and restoration?",
    "notice": "Watch the transition between Micah and Zephaniah. Notice justice, mercy, humility, Messiah.",
    "concept": "Micah: Justice, Mercy, Messiah. Nahum: Judgment on Oppression. Habakkuk: Faith While Waiting. Zephaniah: Judgment and Restoration."
  },
  {
    "day": 65,
    "passage": "Haggai 1-2; Zechariah 1-12",
    "question": "How does the Bible move from put god first into future king and restoration?",
    "notice": "Watch the transition between Haggai and Zechariah. Notice priorities, temple, obedience, restoration.",
    "concept": "Haggai: Put God First. Zechariah: Future King and Restoration."
  },
  {
    "day": 66,
    "passage": "Zechariah 13-14; Malachi 1-4; Matthew 1-8",
    "question": "How does the Bible move from future king and restoration into jesus the promised king?",
    "notice": "Watch the transition between Zechariah and Matthew. Notice restoration, Messiah, temple, hope.",
    "concept": "Zechariah: Future King and Restoration. Malachi: Waiting for the Messenger. Matthew: Jesus the Promised King."
  },
  {
    "day": 67,
    "passage": "Matthew 9-22",
    "question": "How does Jesus fulfill Israel's story and announce God's kingdom?",
    "notice": "Watch for Messiah, kingdom, teaching, fulfillment.",
    "concept": "Matthew: Jesus the Promised King."
  },
  {
    "day": 68,
    "passage": "Matthew 23-28; Mark 1-8",
    "question": "How does the Bible move from jesus the promised king into jesus the servant king?",
    "notice": "Watch the transition between Matthew and Mark. Notice Messiah, kingdom, teaching, fulfillment.",
    "concept": "Matthew: Jesus the Promised King. Mark: Jesus the Servant King."
  },
  {
    "day": 69,
    "passage": "Mark 9-16; Luke 1-6",
    "question": "How does the Bible move from jesus the servant king into jesus the savior for all?",
    "notice": "Watch the transition between Mark and Luke. Notice authority, discipleship, suffering, cross.",
    "concept": "Mark: Jesus the Servant King. Luke: Jesus the Savior for All."
  },
  {
    "day": 70,
    "passage": "Luke 7-20",
    "question": "How does Jesus bring good news to outsiders and the overlooked?",
    "notice": "Watch for salvation, compassion, Spirit, mission.",
    "concept": "Luke: Jesus the Savior for All."
  },
  {
    "day": 71,
    "passage": "Luke 21-24; John 1-10",
    "question": "How does the Bible move from jesus the savior for all into believe and have life?",
    "notice": "Watch the transition between Luke and John. Notice salvation, compassion, Spirit, mission.",
    "concept": "Luke: Jesus the Savior for All. John: Believe and Have Life."
  },
  {
    "day": 72,
    "passage": "John 11-21; Acts 1-3",
    "question": "How does the Bible move from believe and have life into the gospel goes out?",
    "notice": "Watch the transition between John and Acts. Notice signs, belief, eternal life, identity.",
    "concept": "John: Believe and Have Life. Acts: The Gospel Goes Out."
  },
  {
    "day": 73,
    "passage": "Acts 4-17",
    "question": "How does the risen Jesus continue His mission through the Spirit-filled church?",
    "notice": "Watch for Spirit, witness, church, mission.",
    "concept": "Acts: The Gospel Goes Out."
  },
  {
    "day": 74,
    "passage": "Acts 18-28; Romans 1-3",
    "question": "How does the Bible move from the gospel goes out into the gospel explained?",
    "notice": "Watch the transition between Acts and Romans. Notice Spirit, witness, church, mission.",
    "concept": "Acts: The Gospel Goes Out. Romans: The Gospel Explained."
  },
  {
    "day": 75,
    "passage": "Romans 4-16; 1 Corinthians 1",
    "question": "How does the Bible move from the gospel explained into a church learning holiness?",
    "notice": "Watch the transition between Romans and 1 Corinthians. Notice sin, grace, justification, new life.",
    "concept": "Romans: The Gospel Explained. 1 Corinthians: A Church Learning Holiness."
  },
  {
    "day": 76,
    "passage": "1 Corinthians 2-15",
    "question": "How should the gospel reshape a divided and immature church?",
    "notice": "Watch for unity, holiness, gifts, resurrection.",
    "concept": "1 Corinthians: A Church Learning Holiness."
  },
  {
    "day": 77,
    "passage": "1 Corinthians 16; 2 Corinthians 1-13",
    "question": "How does the Bible move from a church learning holiness into strength in weakness?",
    "notice": "Watch the transition between 1 Corinthians and 2 Corinthians. Notice unity, holiness, gifts, resurrection.",
    "concept": "1 Corinthians: A Church Learning Holiness. 2 Corinthians: Strength in Weakness."
  },
  {
    "day": 78,
    "passage": "Galatians 1-6; Ephesians 1-6; Philippians 1-2",
    "question": "How does the Bible move from freedom by faith into joy and christlike humility?",
    "notice": "Watch the transition between Galatians and Philippians. Notice grace, faith, freedom, Spirit.",
    "concept": "Galatians: Freedom by Faith. Ephesians: One New People in Christ. Philippians: Joy and Christlike Humility."
  },
  {
    "day": 79,
    "passage": "Philippians 3-4; Colossians 1-4; 1 Thessalonians 1-5; 2 Thessalonians 1-3",
    "question": "How does the Bible move from joy and christlike humility into steady while waiting?",
    "notice": "Watch the transition between Philippians and 2 Thessalonians. Notice joy, humility, perseverance, Christ.",
    "concept": "Philippians: Joy and Christlike Humility. Colossians: Christ Is Supreme. 1 Thessalonians: Hope and Holy Living. 2 Thessalonians: Steady While Waiting."
  },
  {
    "day": 80,
    "passage": "1 Timothy 1-6; 2 Timothy 1-4; Titus 1-3; Philemon 1",
    "question": "How does the Bible move from healthy church life into the gospel and reconciliation?",
    "notice": "Watch the transition between 1 Timothy and Philemon. Notice leadership, doctrine, godliness, endurance.",
    "concept": "1 Timothy: Healthy Church Life. 2 Timothy: Finish Faithfully. Titus: Sound Teaching, Good Works. Philemon: The Gospel and Reconciliation."
  },
  {
    "day": 81,
    "passage": "Hebrews 1-13; James 1",
    "question": "How does the Bible move from jesus is better into faith that works?",
    "notice": "Watch the transition between Hebrews and James. Notice priesthood, covenant, sacrifice, faith.",
    "concept": "Hebrews: Jesus Is Better. James: Faith That Works."
  },
  {
    "day": 82,
    "passage": "James 2-5; 1 Peter 1-5; 2 Peter 1-3; 1 John 1-2",
    "question": "How does the Bible move from faith that works into assurance, truth, love?",
    "notice": "Watch the transition between James and 1 John. Notice works, speech, wisdom, endurance.",
    "concept": "James: Faith That Works. 1 Peter: Hope in Suffering. 2 Peter: Grow and Stay Alert. 1 John: Assurance, Truth, Love."
  },
  {
    "day": 83,
    "passage": "1 John 3-5; 2 John 1; 3 John 1; Jude 1; Revelation 1-8",
    "question": "How does the Bible move from assurance, truth, love into jesus wins and makes all things new?",
    "notice": "Watch the transition between 1 John and Revelation. Notice assurance, love, truth, obedience.",
    "concept": "1 John: Assurance, Truth, Love. 2 John: Truth with Love. 3 John: Faithful Hospitality. Jude: Contend for the Faith. Revelation: Jesus Wins and Makes All Things New."
  },
  {
    "day": 84,
    "passage": "Revelation 9-22",
    "question": "How does the Bible end with worship, judgment, victory, and new creation?",
    "notice": "Watch for worship, perseverance, judgment, new creation.",
    "concept": "Revelation: Jesus Wins and Makes All Things New."
  }
];

export const AUTUMN_HOME_ENABLED = true;
export const AUTUMN_PROGRESS_KEY = 'elroi-autumn-2026-v1';
export const AUTUMN_WEEKS = [
  'Beginnings & Rescue', 'Covenant & Promised Land', 'Judges & Kings',
  'Kingdom & Exile', 'Return & Perseverance', 'Prayer & Worship',
  'Wisdom & Hope', 'The Prophets Speak', 'Faith Through Exile',
  'The Promised King', 'Good News for the World', 'Hope & New Creation',
];
export function readingForDay(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  return AUTUMN_READINGS.find(reading => reading.day === Number(value));
}
export function parseAutumnProgress(raw: string | null): number[] {
  try {
    const value: unknown = JSON.parse(raw || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 84))].sort((a,b) => a-b) : [];
  } catch { return []; }
}
export function readingPassageUrl(passage: string) {
  return 'https://www.biblegateway.com/passage/?' + new URLSearchParams({search: passage, version:'KJV'}).toString();
}
export function readingCallUrl(reading: AutumnReading) {
  return '/schedule/?' + new URLSearchParams({source:'autumn-reading',content:'bible_study',topic:`Day ${reading.day} of my Bible reading plan. Help me study ${reading.passage}`}).toString();
}
