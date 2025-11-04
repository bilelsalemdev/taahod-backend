import Adhkar from '../models/Adhkar';

export const adhkarData = [
  // Morning Adhkar
  {
    titleAr: 'آية الكرسي',
    textAr:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      'Allahu la ilaha illa huwa al-hayyu al-qayyum, la ta\'khudhuhu sinatun wa la nawm...',
    translation:
      'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...',
    category: 'morning',
    timeOfDay: 'morning',
    repetitions: 1,
    source: 'Quran 2:255',
  },
  {
    titleAr: 'سبحان الله وبحمده',
    textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhan Allahi wa bihamdihi',
    translation: 'Glory be to Allah and praise Him',
    category: 'morning',
    timeOfDay: 'morning',
    repetitions: 100,
    source: 'Sahih Muslim',
  },
  {
    titleAr: 'لا إله إلا الله وحده',
    textAr:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      'La ilaha illa Allahu wahdahu la sharika lah, lahu al-mulku wa lahu al-hamdu wa huwa \'ala kulli shay\'in qadir',
    translation:
      'There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things',
    category: 'morning',
    timeOfDay: 'morning',
    repetitions: 10,
    source: 'Sahih Bukhari',
  },

  // Evening Adhkar
  {
    titleAr: 'أمسينا وأمسى الملك لله',
    textAr:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      'Amsayna wa amsa al-mulku lillah, wal-hamdu lillah, la ilaha illa Allahu wahdahu la sharika lah...',
    translation:
      'We have entered the evening and the dominion belongs to Allah, and praise is to Allah...',
    category: 'evening',
    timeOfDay: 'evening',
    repetitions: 1,
    source: 'Sahih Muslim',
  },
  {
    titleAr: 'اللهم بك أمسينا',
    textAr:
      'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    transliteration:
      'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka al-masir',
    translation:
      'O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the return',
    category: 'evening',
    timeOfDay: 'evening',
    repetitions: 1,
    source: 'Sunan At-Tirmidhi',
  },

  // Sleep Adhkar
  {
    titleAr: 'باسمك اللهم أموت وأحيا',
    textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live',
    category: 'sleep',
    timeOfDay: 'night',
    repetitions: 1,
    source: 'Sahih Bukhari',
  },
  {
    titleAr: 'اللهم قني عذابك',
    textAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: 'Allahumma qini \'adhabaka yawma tab\'athu \'ibadak',
    translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants',
    category: 'sleep',
    timeOfDay: 'night',
    repetitions: 3,
    source: 'Sunan Abu Dawud',
  },

  // Prayer Adhkar
  {
    titleAr: 'أستغفر الله',
    textAr: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    category: 'prayer',
    timeOfDay: 'anytime',
    repetitions: 3,
    source: 'Sahih Muslim',
  },
  {
    titleAr: 'اللهم أنت السلام',
    textAr:
      'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      'Allahumma anta as-salamu wa minka as-salam, tabarakta ya dhal-jalali wal-ikram',
    translation:
      'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of majesty and honor',
    category: 'prayer',
    timeOfDay: 'anytime',
    repetitions: 1,
    source: 'Sahih Muslim',
  },

  // General Adhkar
  {
    titleAr: 'سبحان الله',
    textAr: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    category: 'general',
    timeOfDay: 'anytime',
    repetitions: 33,
    source: 'Sahih Bukhari',
  },
  {
    titleAr: 'الحمد لله',
    textAr: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    category: 'general',
    timeOfDay: 'anytime',
    repetitions: 33,
    source: 'Sahih Bukhari',
  },
  {
    titleAr: 'الله أكبر',
    textAr: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    category: 'general',
    timeOfDay: 'anytime',
    repetitions: 34,
    source: 'Sahih Bukhari',
  },

  // Food Adhkar
  {
    titleAr: 'بسم الله',
    textAr: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    category: 'food',
    timeOfDay: 'anytime',
    repetitions: 1,
    source: 'Sunan At-Tirmidhi',
  },
  {
    titleAr: 'الحمد لله الذي أطعمنا',
    textAr:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration:
      'Alhamdulillah alladhi at\'amana wa saqana wa ja\'alana muslimin',
    translation:
      'All praise is due to Allah who has fed us and given us drink and made us Muslims',
    category: 'food',
    timeOfDay: 'anytime',
    repetitions: 1,
    source: 'Sunan Abu Dawud',
  },

  // Travel Adhkar
  {
    titleAr: 'سبحان الذي سخر لنا هذا',
    textAr:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun',
    translation:
      'Glory be to Him who has subjected this to us, and we could never have it by our efforts. Surely, to our Lord we are returning',
    category: 'travel',
    timeOfDay: 'anytime',
    repetitions: 1,
    source: 'Quran 43:13-14',
  },
];

/**
 * Seed adhkar data into the database
 */
export const seedAdhkar = async (): Promise<void> => {
  try {
    // Check if adhkar already exist
    const count = await Adhkar.countDocuments();
    
    if (count > 0) {
      console.log('Adhkar data already exists. Skipping seed.');
      return;
    }

    // Insert adhkar data
    await Adhkar.insertMany(adhkarData);
    console.log(`✅ Successfully seeded ${adhkarData.length} adhkar`);
  } catch (error) {
    console.error('❌ Error seeding adhkar:', error);
    throw error;
  }
};
