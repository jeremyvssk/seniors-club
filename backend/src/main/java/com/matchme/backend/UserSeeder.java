//User seeder runs when backend starts up.. If there are less than 100 users in the database, will seed 100 random users. 

package com.matchme.backend;

import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Random;
import java.util.List;
import java.util.Collections;

@Component
@Profile("seed")
public class UserSeeder implements CommandLineRunner {

    private static final Random RANDOM = new Random();

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserSeeder(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long userCount = userRepository.count();

        if (userCount >= 100) {
            System.out.println("Database already has " + userCount + "users. Skipping seeding");
            return;
        }

        // generate new users

        for (int i = 0; i < 100; i++) {
            User user = new User();
            user.setEmail("testuser" + (userCount + i) + "@example.com");
            user.setPassword("dummyPassword123");

            userRepository.save(user);

            UserProfile profile = new UserProfile();
            profile.setUser(user);

            profile.setName(randomFullName());
            profile.setAge(randomAge());
            profile.setGender(randomGender());
            profile.setHobbies(randomHobbies());
            profile.setLookingFor(randomLookingFor());
            profile.setLookingForGender(randomLookingForGender());

            City city = randomCity();
            profile.setLatitude(city.lat());
            profile.setLongitude(city.lon());
            profile.setMaxRadiusKm(randomRadius());
            profile.setProfileCompleted(true);

            // save the user
            userProfileRepository.save(profile);

        }

        System.out.println("users seeded");

    }

    // generate random names:

    private static final String[] FIRST_NAMES = {
            "Alex", "Sam", "Chris", "Jamie", "Taylor",
            "Mark", "Daniel", "Karl", "Martin", "Robert",
            "Laura", "Anna", "Maria", "Eva", "Katrin"
    };

    private static final String[] LAST_NAMES = {
            "Tamm", "Saar", "Sepp", "Mägi", "Kask",
            "Kallas", "Ilves", "Põder", "Rebane", "Lepp"
    };

    private static String randomFullName() {
        String first = FIRST_NAMES[RANDOM.nextInt(FIRST_NAMES.length)];
        String last = LAST_NAMES[RANDOM.nextInt(LAST_NAMES.length)];
        return first + " " + last;
    }

    // generate age

    private static int randomAge() {
        return 18 + RANDOM.nextInt(100);
    }

    // generate gender
    private static String randomGender() {
        String[] genders = { "man", "woman", "other" };
        return genders[RANDOM.nextInt(genders.length)];
    }

    // generate hobbies 3-10
    private static List<String> randomHobbies() {
        List<String> hobbies = new ArrayList<>(List.of(
                "Reading", "Gardening", "Walking", "Cooking",
                "Music", "Arts & Crafts", "Photography",
                "Travel", "Sports", "Dancing", "Board Games", "volunteering"));

        Collections.shuffle(hobbies, RANDOM);

        int count = 3 + RANDOM.nextInt(8); //
        return new ArrayList<>(hobbies.subList(0, count));

    }

    // random what they looking for
    private static String randomLookingFor() {
        String[] options = { "love", "friend", "travel", "open" };
        return options[RANDOM.nextInt(options.length)];
    }

    // random lookingfor gender
    private static List<String> randomLookingForGender() {
        List<String> genders = new ArrayList<>(List.of("man", "woman", "other"));
        Collections.shuffle(genders, RANDOM);

        int count = 1 + RANDOM.nextInt(3); // 1–3 genders
        return new ArrayList<>(genders.subList(0, count));

    }

    // random city and coordinates == migjht need to remove city names
    private record City(String name, double lat, double lon) {
    }

    private static final City[] ESTONIAN_CITIES = {
            new City("Tallinn", 59.4370, 24.7536),
            new City("Tartu", 58.3776, 26.7290),
            new City("Pärnu", 58.3859, 24.4971),
            new City("Narva", 59.3797, 28.1791),
            new City("Viljandi", 58.3639, 25.5903),
            new City("Rakvere", 59.3464, 26.3558),
            new City("Kuressaare", 58.2481, 22.5039),
            new City("Haapsalu", 58.9431, 23.5414)
    };

    private static City randomCity() {
        return ESTONIAN_CITIES[RANDOM.nextInt(ESTONIAN_CITIES.length)];

    }

    // random radius
    private static Integer randomRadius() {
        int[] options = { 5, 10, 25, 50, 100, 150, 200 };
        return options[RANDOM.nextInt(options.length)];
    }

}
