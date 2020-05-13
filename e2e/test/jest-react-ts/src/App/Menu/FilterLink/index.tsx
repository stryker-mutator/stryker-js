import React from 'react'
import { Link } from '@reach/router'
import { Routes } from '../../../index'

interface Props {
  path: Routes
}

const FilterLink: React.FC<Props> = ({ path }) => {
  return (
    <ul className="filters">
      <li>
        <Link
          data-cy="all-filter"
          className={path === '/' ? 'selected' : ''}
          to="/"
        >
          All
        </Link>
      </li>
      <li>
        <Link
          data-cy="active-filter"
          className={path === '/active' ? 'selected' : ''}
          to="/active"
        >
          Active
        </Link>
      </li>
      <li>
        <Link
          data-cy="completed-filter"
          className={path === '/completed' ? 'selected' : ''}
          to="/completed"
        >
          Completed
        </Link>
      </li>
    </ul>
  )
}

export default FilterLink
