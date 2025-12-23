import { useState } from 'react'
import './Tabs.css'

function Tabs({ tabs, activeTabId, onTabChange, onTabClose, onNewTab, onCloseAll }) {
  const [showAllTabs, setShowAllTabs] = useState(false)

  const handleTabClick = (tabId) => {
    onTabChange(tabId)
  }

  const handleTabClose = (e, tabId) => {
    e.stopPropagation()
    onTabClose(tabId)
  }

  return (
    <div className="tabs-container">
      <div className="tabs-bar">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="tab-title">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  className="tab-close"
                  onClick={(e) => handleTabClose(e, tab.id)}
                  aria-label="Закрыть вкладку"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="tabs-actions">
          <button className="tabs-action-button" onClick={onNewTab} title="Новая вкладка">
            +
          </button>
          <button
            className="tabs-action-button"
            onClick={onCloseAll}
            title="Закрыть все вкладки"
          >
            ✕✕
          </button>
          <button
            className="tabs-action-button"
            onClick={() => setShowAllTabs(!showAllTabs)}
            title="Показать все вкладки"
          >
            ☰
          </button>
        </div>
      </div>
      {showAllTabs && (
        <div className="tabs-overview">
          <div className="tabs-overview-header">
            <h3>Все вкладки ({tabs.length})</h3>
            <button onClick={() => setShowAllTabs(false)}>×</button>
          </div>
          <div className="tabs-overview-list">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tabs-overview-item ${activeTabId === tab.id ? 'active' : ''}`}
                onClick={() => {
                  handleTabClick(tab.id)
                  setShowAllTabs(false)
                }}
              >
                <div className="tabs-overview-content">
                  <h4>{tab.title}</h4>
                  <p>{tab.description || 'Нет описания'}</p>
                </div>
                <button
                  className="tabs-overview-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTabClose(e, tab.id)
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tabs

