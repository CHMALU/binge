const API_KEY = process.env.TMDB_API_KEY || 'd2757106d0eb71e8dbc5c994b59fbab6';

const movie = await fetch(`https://api.themoviedb.org/3/movie/27205?api_key=${API_KEY}&language=en-US`).then(r => r.json());
console.log('=== MOVIE (Inception) ===');
console.log(JSON.stringify(movie, null, 2));

const tv = await fetch(`https://api.themoviedb.org/3/tv/1396?api_key=${API_KEY}&language=en-US`).then(r => r.json());
console.log('\n=== TV (Breaking Bad) ===');
console.log(JSON.stringify(tv, null, 2));
