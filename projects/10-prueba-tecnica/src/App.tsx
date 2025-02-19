import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SortBy, type User } from './types.d'
import { UsersList } from './components/UsersList'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [showColors, setShowColors] = useState(false)
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE)
  const [filterCountry, setFilterCountry] = useState<string | null>(null)

  const originalUsers = useRef<User[]>([])

  const toggleColors = () => {
    setShowColors(!showColors)
  }

  const toggleSortByCountry = () => {
    const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    setSorting(newSortingValue)
  }

  const handleDelete = (uuid: string) => {
    const filteredUsers = users.filter((user) => (
      user.login.uuid !== uuid
    ))
    setUsers(filteredUsers)
  }

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort)
  }

  const handleReset = () => {
    setUsers(originalUsers.current)
  }
  
  useEffect(() => {
    fetch('https://randomuser.me/api?results=100')
      .then(res => res.json())
      .then(res => {
        setUsers(res.results)
        originalUsers.current = res.results
      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  const filteredUsers = useMemo(() => {
    console.log('filter users')
    return filterCountry !== null && filterCountry.length > 0
    ? users.filter((user) => {
      return user.location.country.toLowerCase().includes(filterCountry.toLowerCase())
    })
    : users
  }, [users, filterCountry])

    const sortedUsers = useMemo(() => {
      console.log('sorted users')

      if (sorting === SortBy.NONE) return filteredUsers

      const compareProperties: Record<string, (user: User) => any> = {
        [SortBy.COUNTRY]: user => user.location.country,
        [SortBy.NAME]: user => user.name.first,
        [SortBy.LAST]: user => user.name.last
      }

      return [...filteredUsers].sort((a, b) => {
        const extractProperty = compareProperties[sorting]
        return extractProperty(a).localeCompare(extractProperty(b))
      })
    }, [filteredUsers, sorting])


  return (
    <>
      <h1>Hola</h1>
      <header>
        <button onClick={toggleColors}>Colorear filas</button>
        <button onClick={toggleSortByCountry}>
          {
            sorting === SortBy.COUNTRY ? 'No ordenar por pais': 'Ordenar por pais'
          }
          </button>
          <button onClick={handleReset}>Resetear estado</button>
          <input placeholder='Filtra por pais' onChange={(e) => {
            setFilterCountry(e.target.value)
          }} />
      </header>
      <main>
        <UsersList changeSorting={handleChangeSort} deleteUser={handleDelete} showColors={showColors} users={sortedUsers}/>
      </main>

    </>
  )
}

export default App
