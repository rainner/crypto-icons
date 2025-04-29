const fs = require( "fs" );
const path = require( "path" );
const client = require( "https" );
const axios = require( "axios" );

const iconsPath = path.join( __dirname, "icons" );
const tmpPath = path.join( __dirname, "assets/tmp" );
const consoleDiv = "-".repeat( 100 );

const sourceRepos = [
  [ "token", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/" ],
  [ "name", "https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/128/" ],
];

// download token new image
const fetchJson = function( address, callback ) {
  const request = {
    method: "GET",
    url: address,
    headers: {
      "Accept": "application/json",
      "User-Agent": "Node.js Applicatioin",
    }
  };
  axios( request ).then( callback ).catch( console.log );
};

// download token new image
const downloadImage = function( url, filepath ) {
  if ( url && !fs.existsSync( filepath ) ) {
    client.get( url, res => {
      console.log( "-".repeat( 100 ) );
      console.log( "Input:", url );
      console.log( "Output:", filepath );

      if ( res.statusCode === 200 ) {
        res.pipe( fs.createWriteStream( filepath ) )
          .on( "error", err => console.log( "Error:", err.message || "Failed to write file." ) )
          .once( "close", () => console.log( "Success:", "Saved file." ) );
      } else {
        console.log( "Failed:", "HTTP Status", res.statusCode );
        res.resume();
      }
    });
  }
};

// fetch symbols and names from coinbase API
const fetchFromCoinbase = function() {
  fetchJson( "https://api.exchange.coinbase.com/currencies", res => {
    const list = res.data || [];

    for ( let repo of sourceRepos ) {
      const [ nameType, baseUrl ] = repo;

      for ( let asset of list ) {
        const { id, name } = asset;
        const lookupTokenFile = String( id ).toLowerCase() + ".png";
        const lookupNameFile = String( name ).toLowerCase().replace( /[^\w]+/g, "-" ) + ".png";
        const outpuFilePath = path.join( iconsPath, lookupTokenFile );

        if ( nameType === "token" ) {
          downloadImage( baseUrl + lookupTokenFile, outpuFilePath );
        }
        if ( nameType === "name" ) {
          downloadImage( baseUrl + lookupNameFile, outpuFilePath );
        }
      }
    }
  });
};

// fetch symbols and names from coincap API
const fetchFromCoincap = function() {
  fetchJson( "https://api.coincap.io/v2/assets?limit=2000", res => {
    const list = res.data?.data || [];

    for ( let repo of sourceRepos ) {
      const [ nameType, baseUrl ] = repo;

      for ( let asset of list ) {
        const { id, symbol } = asset;
        const lookupTokenFile = String( symbol ).toLowerCase() + ".png";
        const lookupNameFile = String( id ).toLowerCase().replace( /[^\w]+/g, "-" ) + ".png";
        const outpuFilePath = path.join( iconsPath, lookupTokenFile );

        if ( nameType === "token" ) {
          downloadImage( baseUrl + lookupTokenFile, outpuFilePath );
        }
        if ( nameType === "name" ) {
          downloadImage( baseUrl + lookupNameFile, outpuFilePath );
        }
      }
    }
  });
};

// look for icons that match tokens listed on coinbase and put them ion a folder
const exportCoinbaseIcons = function() {
  fetchJson( "https://api.exchange.coinbase.com/currencies", res => {
    const currencies = res.data || [];
    const tokens = currencies.map( c => c.id );
    const stats = { total: tokens.length, count: 0 };

    console.log( consoleDiv );
    console.log( "Looking for icons thay match token list from Coinbase.com ..." );
    console.log( tokens );

    for ( let token of tokens ) {
      const iconName = String( token ).toLowerCase() +".png";
      const lookupPath = path.join( iconsPath, iconName );
      const outputPath = path.join( tmpPath, iconName );

      if ( fs.existsSync( lookupPath ) ) {
        console.log( consoleDiv );
        console.log( "Copying:", outputPath );

        try {
          fs.copyFileSync( lookupPath, outputPath, fs.constants.COPYFILE_EXCL );
          console.log( "OK!" );
          stats.count += 1;
        } catch ( e ) {
          console.log( "FAILED:", e.message || "No message." );
        }
      }
    }
    console.log( consoleDiv );
    console.log( "Total:", stats.count, "/", stats.total );
  });
};

// run
// exportCoinbaseIcons();
