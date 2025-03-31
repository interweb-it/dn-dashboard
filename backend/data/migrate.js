const sqlite3 = require('sqlite3');
// const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const sequelize = require('sequelize');

dotenv.config({ path: '../.env' });

// SQLite database file
const sqliteDbPath = './database.sqlite';

const db = new sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Nominations = db.define('Nominations', {
  chainId: {
    type: sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  stash: {
    type: sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  datehour: {
    type: sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  active: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  commission: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  nom_dn: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  nom_non: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  nom_value_dn: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  nom_value_non: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  exposure_dn: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  exposure_non: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: sequelize.DATE,
    allowNull: false,
  },
});

/**
 CREATE TABLE `Nominations` (
  `chainId` varchar(255) NOT NULL,
  `stash` varchar(255) NOT NULL,
  `datehour` varchar(255) NOT NULL,
  `active` tinyint(11) DEFAULT NULL,
  `commission` int(11) DEFAULT NULL,
  `nom_dn` bigint(11) DEFAULT NULL COMMENT 'nominator count for DN',
  `nom_non` bigint(11) DEFAULT NULL COMMENT 'nominator count for non-DN',
  `nom_value_dn` bigint(11) DEFAULT NULL COMMENT 'nomination value for DN',
  `nom_value_non` bigint(11) DEFAULT NULL COMMENT 'nomination value for non-DN',
  `exposure_dn` bigint(11) DEFAULT NULL COMMENT 'exposure value for DN',
  `exposure_non` bigint(11) DEFAULT NULL COMMENT 'exposure value for non-DN',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`chainId`,`stash`,`datehour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
 */

(async () => {
  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READONLY);

  // Fetch data from SQLite Nominations table
  sqliteDb.all('SELECT * FROM Nominations', async (err, rows) => {
    if (err) {
      console.error('Error fetching data from SQLite:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('No data found in SQLite Nominations table.');
      return;
    }

    // Insert data into MariaDB
    for (const row of rows) {
      await Nominations.upsert(row);
    }

    console.log('Migration completed successfully.');

    // Close connections
    sqliteDb.close();
    // await mariadbConn.end();
    await db.close();
  });
})();
