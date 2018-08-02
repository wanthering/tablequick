#create new mysql table very quickly using brief yaml config.

### Step 1: Install globally
```
npm i tablequick -g
```

### Step 2: create and edit a mysql file to connect to mysql
```
tablequick config
```
then you will got a `mysql-config.json`
here fill out the .json file so we can connect to your database.

### Step 3:
so if you want create a table named "students" and include fields: "student_code","gender","register_time"

first create a yaml file with the name of table:
```
touch students.yaml
```

**students.yaml**
```
student_code: $$i
name: c100
gender: c6
register_time: t
```

then process this file using tablequick
```
tablequick create students
```
### result:
now you got a perfect students table like this, just with a very brief .yaml config file!
student_code | name | gender | register_time
-|-|-|-
1|wanthering|male|2018-06-27 14:51:31

the mysql input is :
```
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `students`;
create table `students`(
DROP TABLE IF EXISTS `students`;
create table `students`(
`student_code` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
`name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
`gender` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
`register_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

# Converting Rules:
yaml input| sql output
-|-
$| PRIMARY KEY
$$|  AUTO_INCREMENT PRIMARY KEY
i|int
i100|int(100) NOT NULL
c|varchar COLLATE utf8mb4_unicode_ci NOT NULL
c100|varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
t|timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
x-> y | KEY `y`(`x`) USING BTREE