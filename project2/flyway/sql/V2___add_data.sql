
INSERT INTO exercises (name, content) VALUES ('Sum of three values','Write a function int sum(int first, int second, int third) that returns the sum of the given integers. As an example, the function call sum(1, 2, 3) should return the value 6.');
INSERT INTO exercises (name, content) VALUES ('Sum with formula', 'Write a function String sumWithFormula(int first, int second) that returns the written out sum of the given integers and the sum. As an example, the function call sumWithFormula(1, 2) should return the string 1+2=3 and the function call sumWithFormula(1, 1) should return the string 1+1=2. Note! Do not add spaces to the returned string.');
INSERT INTO exercises (name, content) VALUES ('Budget check', 'Write a function String budgetCheck(double budget, double currentSpending) that returns information on whether a given budget is in order in light of given spending. If the value of currentSpending is larger than the value of budget, the function should return "Budget: Overspending". Otherwise, the function should return "Budget: OK".');
INSERT INTO exercises (name, content) VALUES ('Mystery function', 'Write a function String mystery(int number) that returns a string based on the number. If the number is divisible by 5, the function should return the string "mys". If the number is divisible by 7, the function should return the string "tery". If the number is divisible by both 5 and 7, the function should return the string "mystery". Otherwise, the function should return a string representation of the given number, e.g. if the number is 1, the function should return "1".');
INSERT INTO exercises (name, content) VALUES ('Sum of negative numbers', 'Write a function int sumOfNegatives(List<int> numbers) that returns the sum of the negative numbers in the given list. For example, if the numbers list would contain the numbers -1, 2, -4, the function should return the value -5.');
INSERT INTO exercises (name, content) VALUES ('Average of positives', 'Write a function double averageOfPositives(List<int> numbers) that returns the average value of the positive numbers on the list. If there are no positive values, the function should return the value -1.');
INSERT INTO exercises (name, content) VALUES ('Video and playlist', 'Implement the classes `Video` and `Playlist` as follows. The class `Video` should have a name (String), a duration in seconds (int), a constructor with named arguments, and a `toString` method. The default name should be "Unknown" and the default length should be 0. The class should work as follows.

~~~java
print(Video(name: "One second clip", duration: 1));
print(Video(name: "Hello again!", duration: 84));
~~~

With the code above, the output should be as follows.

~~~java
One second clip (1 second)
Hello again! (84 seconds)
~~~

The class `Playlist` should contain a list of videos, provide a default (no argument) constructor, and offer the following methods: (1) `void add(Video video)` that adds a video to the playlist, (2) `bool has(String name)` that returns true if the list of videos contains a video with the given name, and (3) `int duration()` that returns the sum of durations of the videos in the playlist. The class should work as follows.

~~~java
final playlist = Playlist();
print(playlist.has("One second clip"));
print(playlist.duration());
playlist.add(Video(name: "One second clip", duration: 1));
playlist.add(Video(name: "Hello again!", duration: 84));
print(playlist.has("One second clip"));
print(playlist.duration());
~~~

With the code above, the output should be as follows.');
INSERT INTO exercises (name, content) VALUES ('Team', 'Create a class Team and implement the two following constructors (and necessary properties) to the class. The default constructor should have three properties: (1) the name of the team (String), (2) the home town of the team (String), and (3) the year the team was formed (int). The named constructor nameAndYear should have two properties: (1) the name of the team (String) and (2) the year the team was formed (int). In the case of the named constructor, the home town of the team must be "Unknown".

Once completed, add a toString method to the class which leads to outputs outlined by the following examples.

~~~java
final hjk = Team("HJK", "Helsinki", 1907);
print(hjk);
final secret = Team.nameAndYear("Secret", 1984);
print(secret);
~~~

With the code above, the output should be as follows.
~~~java
HJK (Helsinki, 1907)
Secret (Unknown, 1984)
~~~');
