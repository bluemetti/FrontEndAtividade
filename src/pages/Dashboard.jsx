import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import ServerSelector from '../components/ServerSelector'

function Navbar(){
  const {user,signOut} = useAuth()
  return (
    <div className="topbar">
      <div>Olá, <strong>{user?.name || user?.email || 'Usuário'}</strong></div>
      <div>
        <button onClick={()=>signOut()} className="btn-small">Sair</button>
      </div>
    </div>
  )
}

function Item({item, onEdit, onDelete}){
  return (
    <div className="item">
      <div style={{flex:1}}>
        <div><strong>{item.title}</strong></div>
        <div className="muted" style={{fontSize:13,marginTop:4}}>{item.description}</div>
      </div>
      <div className="actions">
        <button className="btn-small" onClick={()=>onEdit(item)}>Editar</button>
        <button className="btn-small btn-danger" onClick={()=>onDelete(item)}>Deletar</button>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const {token} = useAuth()
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(false)
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [editing, setEditing] = useState(null)

  async function loadItems(){
    setLoading(true)
    try{
      const data = await api.get('/items')
      setItems(data || [])
    }catch(err){
      console.error(err)
    }finally{setLoading(false)}
  }

  useEffect(()=>{ loadItems() },[token])

  async function handleSave(e){
    e.preventDefault()
    try{
      if(editing){
        await api.put(`/items/${editing.id}`,{title,description})
        toast.success('Item atualizado!')
      }else{
        await api.post('/items',{title,description})
        toast.success('Item criado!')
      }
      setTitle('')
      setDescription('')
      setEditing(null)
      loadItems()
    }catch(err){console.error(err)}
  }

  async function handleDelete(item){
    if(!confirm('Confirma deletar esse item?')) return
    try{
      await api.del(`/items/${item.id}`)
      toast.success('Item deletado!')
      loadItems()
    }catch(err){console.error(err)}
  }

  function handleEdit(item){
    setEditing(item)
    setTitle(item.title)
    setDescription(item.description)
  }

  return (
    <div className="container">
      <div className="card">
        <Navbar />
        <ServerSelector />
        <h3>Área Logada — Gerenciar Items</h3>
        <form onSubmit={handleSave} style={{marginBottom:16,marginTop:16}}>
          <input placeholder="Título do item" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
          <div className="row">
            <button type="submit">{editing? 'Salvar alterações':'Adicionar item'}</button>
            {editing && <button type="button" onClick={()=>{setEditing(null); setTitle(''); setDescription('')}} style={{background:'#6b7280'}}>Cancelar</button>}
          </div>
        </form>

        <h4 style={{marginTop:24,marginBottom:12}}>Seus items:</h4>
        <div className="items-list">
          {loading ? <div className="muted">Carregando...</div> : (
            items.length === 0 ? <div className="muted">Nenhum item encontrado. Crie um acima!</div> : items.map(it=> <Item key={it.id} item={it} onEdit={handleEdit} onDelete={handleDelete} />)
          )}
        </div>
      </div>
    </div>
  )
}
