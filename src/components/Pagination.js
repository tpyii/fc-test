import React from 'react';

function Pagination({pagination, changePage}) {
  return (
    <React.Fragment>
      {
        !pagination.links 
          ? null 
          : (
            <nav aria-label="Search results pages">
              <ul className="pagination">

                <li className={pagination.page === 1 ? 'page-item disabled' : 'page-item'}>
                  {pagination.page === 1 
                    ? <span className="page-link">Previous</span> 
                    : <a className="page-link" href="#" onClick={() => changePage(pagination.page - 1)}>Previous</a>
                  }
                </li>

                {pagination.links.map(link => {
                  return (
                    <li 
                      className={`page-item ${link.active ? 'active' : ''} ${link.disabled ? 'disabled' : ''}`}
                      key={link.id}
                    >
                      {link.active || link.disabled
                        ? <span className="page-link">{link.label}</span>
                        : <a className="page-link" href="#" onClick={() => changePage(link.id)}>{link.label}</a>
                      }
                    </li>
                  )
                })}

                <li className={pagination.page == pagination.links[pagination.links.length - 1].label ? 'page-item disabled' : 'page-item'}>
                  {pagination.page == pagination.links[pagination.links.length - 1].label
                    ? <span className="page-link">Next</span> 
                    : <a className="page-link" href="#" onClick={() => changePage(pagination.page + 1)}>Next</a>
                  }
                </li>
                
              </ul>
            </nav>
          )
      }
    </React.Fragment>
  )
}

export default Pagination;