// User seeder runs when backend starts with the "seed" profile.
// Creates hand-made demo users with photos (you can log in as them), a few ready-made
// matches/requests/chats for Kaja, and random filler users so Explore never runs dry.
// Safe to run on every start: if the demo users already exist it does nothing.
// Bios must stay within 150 characters, the same limit the app has.

package com.matchme.backend;

import com.matchme.backend.model.Chat;
import com.matchme.backend.model.Match;
import com.matchme.backend.model.Message;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.ChatRepository;
import com.matchme.backend.repo.MatchRepository;
import com.matchme.backend.repo.MessageRepository;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Component
@Profile("seed")
public class UserSeeder implements CommandLineRunner {

    public static final String DEMO_PASSWORD = "demo1234";
    private static final int FILLER_COUNT = 60;
    private static final Random RANDOM = new Random(42);
    private static final List<String> ALL_GENDERS = List.of("man", "woman", "other");

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final MatchRepository matchRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;
    private final Path uploadDir;

    public UserSeeder(UserRepository userRepository, UserProfileRepository userProfileRepository,
            MatchRepository matchRepository, ChatRepository chatRepository, MessageRepository messageRepository,
            PasswordEncoder passwordEncoder, @Value("${file.upload-dir:uploads}") String uploadPath) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.matchRepository = matchRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath();
    }

    // demo people: key (= photo + email name), name, age, gender, lookingFor, hobbies, bio, lat, lon
    private record Demo(String key, String name, int age, String gender, String lookingFor,
            List<String> hobbies, String bio, double lat, double lon, boolean photo) {
    }

    private static final List<Demo> DEMOS = List.of(
            new Demo("kaja", "Kaja", 67, "woman", "friend",
                    List.of("Walking", "Photography", "Gardening", "Reading"),
                    "Early walks with my camera, afternoons in the garden. Looking for good company for both.",
                    59.4370, 24.7536, true),
            new Demo("henrik", "Henrik", 71, "man", "love",
                    List.of("Board Games", "Walking", "Photography"),
                    "Retired ship engineer. Looking for someone to share Sunday markets, long lunches and terrible crosswords with.",
                    59.4450, 24.7200, true),
            new Demo("maie", "Maie", 64, "woman", "love",
                    List.of("Dancing", "Music", "Cooking", "Reading"),
                    "I still dance every Friday at the community hall. Bring comfortable shoes and a good appetite.",
                    59.4120, 24.8010, true),
            new Demo("mart", "Mart", 69, "man", "travel",
                    List.of("Travel", "Sports", "Walking", "Volunteering", "Photography", "Board Games", "Music", "Arts & Crafts"),
                    // close to the 150-character bio limit: tests the long bio layout
                    "Planning a slow trip down the coast, stopping at every lighthouse and bakery. "
                            + "I need a co-pilot who picks the music and knows when it's coffee time.",
                    59.3950, 24.6600, true),
            new Demo("anne", "Anne", 63, "woman", "friend",
                    List.of("Cooking", "Gardening", "Reading"),
                    "Former school teacher. My kitchen is always open and my tomatoes are the best on the street.",
                    59.4390, 24.7560, true),
            new Demo("toomas", "Toomas", 66, "man", "open",
                    List.of("Sports", "Walking", "Music"),
                    "", // no bio on purpose: tests the "hasn't written a bio yet" state
                    59.4700, 24.8300, true),
            new Demo("viktor", "Viktor", 74, "man", "love",
                    List.of("Photography", "Music", "Reading"),
                    "Jazz records, black-and-white film and a very patient cat.",
                    59.3600, 24.6000, true),
            new Demo("peeter", "Peeter", 65, "man", "friend",
                    List.of("Gardening", "Walking", "Board Games"),
                    "Allotment on weekdays, chess in the park on Sundays.",
                    59.4250, 24.7700, true),
            new Demo("helgi", "Helgi", 72, "woman", "open",
                    List.of("Reading", "Arts & Crafts", "Volunteering", "Music", "Dancing"),
                    "Choir, crafts fairs and far too many library books.",
                    59.4550, 24.7000, true),
            new Demo("annekristiina", "Anne-Kristiina", 70, "woman", "friend",
                    List.of("Arts & Crafts", "Volunteering", "Reading", "Gardening"),
                    "Knitting circle on Tuesdays, library volunteer on Thursdays. The rest of the week is wide open.",
                    59.3300, 24.5500, false) // no photo on purpose: tests the fallback
    );

    // all or nothing: a failure halfway would leave half the demo users and block every later seed
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail("kaja@demo.ee")) {
            System.out.println("Demo users already seeded. Skipping seeding");
            return;
        }

        String hash = passwordEncoder.encode(DEMO_PASSWORD);
        Map<String, Long> ids = new HashMap<>();

        for (Demo d : DEMOS) {
            User user = new User();
            user.setEmail(d.key() + "@demo.ee");
            user.setPassword(hash);
            userRepository.save(user);

            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setName(d.name());
            profile.setAge(d.age());
            profile.setGender(d.gender());
            profile.setBio(d.bio());
            profile.setHobbies(new ArrayList<>(d.hobbies()));
            profile.setLookingFor(d.lookingFor());
            profile.setLookingForGender(new ArrayList<>(ALL_GENDERS));
            profile.setLatitude(d.lat());
            profile.setLongitude(d.lon());
            profile.setMaxRadiusKm(100);
            profile.setProfileCompleted(true);
            if (d.photo()) {
                profile.setProfilePictureUrl(copySeedImage(d.key()));
            }
            userProfileRepository.save(profile);
            ids.put(d.key(), user.getId());
        }

        // Kaja gets something in every tab: matches with chats, and incoming requests
        Long kaja = ids.get("kaja");
        matched(kaja, ids.get("peeter"));
        matched(kaja, ids.get("helgi"));
        matched(kaja, ids.get("anne"));
        request(ids.get("viktor"), kaja);
        request(ids.get("toomas"), kaja);

        chat(ids.get("peeter"), kaja, 0, List.of(
                new String[] { "peeter", "Good morning! Did the rain spare your tomatoes?" },
                new String[] { "kaja", "Mostly! The basil did not make it, sadly." },
                new String[] { "peeter", "I have spare basil seedlings. Happy to bring some to the community garden on Saturday." },
                new String[] { "kaja", "That would be lovely. 10 o'clock by the gate?" }), ids);
        chat(ids.get("helgi"), kaja, 2, List.of(
                new String[] { "helgi", "Hello Kaja! I saw you like photography too." },
                new String[] { "helgi", "The craft fair is on Sunday, want to come along with me?" }), ids);

        seedFillers(hash);
        System.out.println("Seeded " + DEMOS.size() + " demo users and " + FILLER_COUNT + " filler users. Password: " + DEMO_PASSWORD);
    }

    // copies src/main/resources/seed-images/<key>.jpg into the uploads folder and returns its url
    private String copySeedImage(String key) {
        String filename = "seed-" + key + ".jpg";
        try (InputStream in = new ClassPathResource("seed-images/" + key + ".jpg").getInputStream()) {
            Files.createDirectories(uploadDir);
            Files.copy(in, uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            System.out.println("Could not copy seed image " + key + ": " + e.getMessage());
            return null;
        }
    }

    private void matched(Long a, Long b) {
        LocalDateTime now = LocalDateTime.now();
        for (Long[] pair : new Long[][] { { a, b }, { b, a } }) {
            Match m = new Match();
            m.setUserId(pair[0]);
            m.setLikedUserId(pair[1]);
            m.setStatus(Match.MatchStatus.MATCHED);
            m.setMatchedAt(now);
            matchRepository.save(m);
        }
    }

    private void request(Long from, Long to) {
        Match m = new Match();
        m.setUserId(from);
        m.setLikedUserId(to);
        m.setStatus(Match.MatchStatus.PENDING);
        matchRepository.save(m);
    }

    // user1 = the other person, user2 = Kaja, so unreadForKaja goes in unreadCountUser2
    private void chat(Long other, Long kaja, int unreadForKaja, List<String[]> lines, Map<String, Long> ids) {
        Chat chat = new Chat();
        chat.setUser1Id(other);
        chat.setUser2Id(kaja);
        chat.setUnreadCountUser1(0);
        chat.setUnreadCountUser2(unreadForKaja);
        chat.setLastMessage(lines.get(lines.size() - 1)[1]);
        chatRepository.save(chat);

        for (int i = 0; i < lines.size(); i++) {
            Message msg = new Message();
            msg.setChatId(chat.getId());
            msg.setSenderId(ids.get(lines.get(i)[0]));
            msg.setContent(lines.get(i)[1]);
            // the last unreadForKaja messages from the other person stay unread
            msg.setIsRead(i < lines.size() - unreadForKaja);
            messageRepository.save(msg);
        }
    }

    // ---------------------------------------------------------------- random fillers (no photo)

    private void seedFillers(String hash) {
        for (int i = 0; i < FILLER_COUNT; i++) {
            User user = new User();
            user.setEmail("filler" + i + "@demo.ee");
            user.setPassword(hash);
            userRepository.save(user);

            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setName(randomFullName());
            profile.setBio(BIOS[RANDOM.nextInt(BIOS.length)]);
            profile.setAge(58 + RANDOM.nextInt(28)); // 58-85
            profile.setGender(ALL_GENDERS.get(RANDOM.nextInt(2))); // man / woman
            profile.setHobbies(randomHobbies());
            profile.setLookingFor(LOOKING_FOR[RANDOM.nextInt(LOOKING_FOR.length)]);
            profile.setLookingForGender(randomLookingForGender());

            City city = ESTONIAN_CITIES[RANDOM.nextInt(ESTONIAN_CITIES.length)];
            profile.setLatitude(city.lat() + (RANDOM.nextDouble() - 0.5) * 0.08);
            profile.setLongitude(city.lon() + (RANDOM.nextDouble() - 0.5) * 0.15);
            profile.setMaxRadiusKm(RADII[RANDOM.nextInt(RADII.length)]);
            profile.setProfileCompleted(true);
            userProfileRepository.save(profile);
        }
    }

    private static final String[] FIRST_NAMES = {
            "Mark", "Karl", "Martin", "Robert", "Anna", "Maria", "Eva", "Katrin",
            "Liisa", "Kristjan", "Jaan", "Piret", "Marika", "Andres", "Karin", "Helen",
            "Tiiu", "Ülle", "Rein", "Aino", "Enn", "Malle", "Heino", "Leida"
    };

    private static final String[] LAST_NAMES = {
            "Tamm", "Saar", "Sepp", "Mägi", "Kask", "Kallas", "Ilves", "Põder", "Rebane", "Lepp",
            "Kukk", "Pärn", "Lill", "Rand", "Järv", "Koppel", "Ots", "Paju", "Vaher", "Nurm"
    };

    private static final String[] BIOS = {
            "Retired and finally have time for the things I always put off.",
            "Grandmother of four, happiest in the garden or at the seaside.",
            "Former bus driver. I know every shortcut in town and I'm happy to share them.",
            "Looking for someone to go to concerts with. My late wife used to come along.",
            "Morning swims all year round. Yes, even in January.",
            "I bake on Sundays and always make too much.",
            "Hiking boots by the door, map in the glovebox.",
            ""
    };

    private static final String[] LOOKING_FOR = { "love", "friend", "travel", "open" };
    private static final int[] RADII = { 25, 50, 100, 150, 200 };

    private static final List<String> HOBBIES = List.of(
            "Reading", "Gardening", "Walking", "Cooking", "Music", "Arts & Crafts",
            "Photography", "Travel", "Sports", "Dancing", "Board Games", "Volunteering");

    private static String randomFullName() {
        return FIRST_NAMES[RANDOM.nextInt(FIRST_NAMES.length)] + " " + LAST_NAMES[RANDOM.nextInt(LAST_NAMES.length)];
    }

    // 2-8 hobbies
    private static List<String> randomHobbies() {
        List<String> hobbies = new ArrayList<>(HOBBIES);
        Collections.shuffle(hobbies, RANDOM);
        return new ArrayList<>(hobbies.subList(0, 2 + RANDOM.nextInt(7)));
    }

    private static List<String> randomLookingForGender() {
        List<String> genders = new ArrayList<>(ALL_GENDERS);
        Collections.shuffle(genders, RANDOM);
        return new ArrayList<>(genders.subList(0, 1 + RANDOM.nextInt(3)));
    }

    private record City(String name, double lat, double lon) {
    }

    private static final City[] ESTONIAN_CITIES = {
            new City("Tallinn", 59.4370, 24.7536),
            new City("Tallinn", 59.4370, 24.7536), // weighted so most fillers are near the demo users
            new City("Tartu", 58.3776, 26.7290),
            new City("Pärnu", 58.3859, 24.4971),
            new City("Narva", 59.3797, 28.1791),
            new City("Viljandi", 58.3639, 25.5903),
            new City("Rakvere", 59.3464, 26.3558),
            new City("Haapsalu", 58.9431, 23.5414)
    };
}
