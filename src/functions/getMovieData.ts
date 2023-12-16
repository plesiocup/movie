import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'

// タイトル、説明、映画カテゴリ、再生時間、評価、評価した人数、公開年、映画のURL
interface MovieData {
  title: string
  description: string
  category: string
  play_time: number
  evaluation: number
  evaluated_count: number
  release_year: number
  movie_url: string
}

export async function getMovieData(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)

  // 画像URLの例
  // https://image.tmdb.org/t/p/w1280/kjQBrc00fB2RjHZB3PGR4w9ibpz.jpg

  const name = request.query.get('name') || (await request.text()) || 'world'
  const responseMovieData = (await fetchMovieData()).body

  const movieData: MovieData[] = []
  responseMovieData.results.forEach((responseMovieData: any) => {
    // "original_title": "Blue Beetle",
    // id: 565770,
    // https://www.themoviedb.org/movie/565770-blue-beetle/watch?locale=AE
    //   スネークケースに変換
    let movieTitle = responseMovieData.title
    movieTitle = movieTitle.toLowerCase().replace(/ /g, '-')
    const movieUrl = `https://www.themoviedb.org/movie/${responseMovieData.id}-${responseMovieData.original_title}/watch?locale=AE`

    const category = getGenreNameById(responseMovieData.genre_ids[0])
    movieData.push({
      title: responseMovieData.title,
      description: responseMovieData.overview,
      category: category,
      play_time: responseMovieData.popularity,
      evaluation: responseMovieData.vote_average / 2,
      evaluated_count: responseMovieData.vote_count,
      release_year: responseMovieData.release_date,
      movie_url: movieUrl,
    })
  })

  //   movieDataをjsonに変換して返す
  return {
    status: 200,
    body: JSON.stringify(movieData),
  }
}

app.http('getMovieData', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: getMovieData,
})

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
