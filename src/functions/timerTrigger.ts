import { app, InvocationContext, HttpRequest, HttpResponseInit, Timer } from "@azure/functions";

interface MovieData {
    Title: string
    Description: string
    Category: string
    Playtime: number
    Evaluation: number
    EvaluatedCount: number
    ReleaseYear: number
    MovieURL: string
  }


export async function timerTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {

    // 画像URLの例
    // https://image.tmdb.org/t/p/w1280/kjQBrc00fB2RjHZB3PGR4w9ibpz.jpg
  
    const responseMovieData = (await fetchMovieData()).body
  
    const movieData: MovieData[] = []
    responseMovieData.results.forEach((responseMovieData: any) => {
      // "original_title": "Blue Beetle",
      // id: 565770,
      // https://www.themoviedb.org/movie/565770-blue-beetle/watch?locale=AE
      //   スネークケースに変換
      let movieTitle = responseMovieData.Title
      movieTitle = movieTitle.toLowerCase().replace(/ /g, '-')
      const movieUrl = `https://www.themoviedb.org/movie/${responseMovieData.id}-${responseMovieData.original_title}/watch?locale=AE`
  
      const category = getGenreNameById(responseMovieData.genre_ids[0])
      movieData.push({
        Title: responseMovieData.Title,
        Description: responseMovieData.overview,
        Category: category,
        Playtime: responseMovieData.popularity,
        Evaluation: responseMovieData.vote_average / 2,
        EvaluatedCount: responseMovieData.vote_count,
        ReleaseYear: responseMovieData.release_date,
        MovieURL: movieUrl,
      })
    })

    const url = "https://generated-with-python.azurewebsites.net/datasRemold/"
    const options = {
        method: 'POST',
        body: JSON.stringify(movieData),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    fetch(url, options)
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log(error)
    })
}

app.timer('timerTrigger', {
    schedule: "0 */10 * * * *",
    handler: timerTrigger
});

const fetchMovieData = async () => {
    const API_URL =
      'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&page=1&language=ja-JP&region=jp&api_key='
    const API_KEY = process.env.API_KEY
  
    try {
      const response = await fetch(API_URL + API_KEY)
      const data = await response.json()
      // 取得したJSONデータの処理
      console.log(data)
      return {
        status: 200,
        body: data,
      }
    } catch (error) {
      // エラー発生時の処理
      console.error('error', error)
      return {
        status: 500,
        body: 'An error occurred while fetching the movie data.',
      }
    }
  }
  
  const genres = [
    {
      id: 28,
      name: 'Action',
    },
    {
      id: 12,
      name: 'Adventure',
    },
    {
      id: 16,
      name: 'Animation',
    },
    {
      id: 35,
      name: 'Comedy',
    },
    {
      id: 80,
      name: 'Crime',
    },
    {
      id: 99,
      name: 'Documentary',
    },
    {
      id: 18,
      name: 'Drama',
    },
    {
      id: 10751,
      name: 'Family',
    },
    {
      id: 14,
      name: 'Fantasy',
    },
    {
      id: 36,
      name: 'History',
    },
    {
      id: 27,
      name: 'Horror',
    },
    {
      id: 10402,
      name: 'Music',
    },
    {
      id: 9648,
      name: 'Mystery',
    },
    {
      id: 10749,
      name: 'Romance',
    },
    {
      id: 878,
      name: 'Science Fiction',
    },
    {
      id: 10770,
      name: 'TV Movie',
    },
    {
      id: 53,
      name: 'Thriller',
    },
    {
      id: 10752,
      name: 'War',
    },
    {
      id: 37,
      name: 'Western',
    },
  ]
  
  function getGenreNameById(id: number): string | undefined {
    const genre = genres.find((genre) => genre.id === id)
    return genre?.name
  }
  