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
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <ServerSelector compact />
        <button onClick={()=>signOut()} className="btn-small">Sair</button>
      </div>
    </div>
  )
}

function WorkoutCard({workout, onEdit, onDelete, onView}){
  return (
    <div className="item">
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
          <div>
            <strong>{workout.name}</strong>
            <span className="muted" style={{marginLeft:8,fontSize:12}}>
              {workout.type} • {workout.duration}min • {new Date(workout.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="muted" style={{fontSize:13,marginTop:4}}>{workout.description}</div>
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="muted" style={{fontSize:12,marginTop:6}}>
            📋 {workout.exercises.length} exercício(s)
          </div>
        )}
      </div>
      <div className="actions">
        <button className="btn-small" style={{background:'#3b82f6'}} onClick={()=>onView(workout)}>Ver</button>
        <button className="btn-small" onClick={()=>onEdit(workout)}>Editar</button>
        <button className="btn-small btn-danger" onClick={()=>onDelete(workout)}>Deletar</button>
      </div>
    </div>
  )
}

function ExerciseForm({exercise, index, onChange, onRemove}){
  return (
    <div style={{padding:12,background:'#f9fafb',borderRadius:6,marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <strong style={{fontSize:14}}>Exercício {index + 1}</strong>
        <button type="button" onClick={onRemove} style={{background:'#ef4444',padding:'4px 8px',fontSize:12}}>
          Remover
        </button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:8}}>
        <input 
          placeholder="Nome do exercício" 
          value={exercise.name || ''} 
          onChange={e=>onChange({...exercise, name:e.target.value})}
          required
        />
        <input 
          type="number" 
          placeholder="Séries" 
          value={exercise.sets || ''} 
          onChange={e=>onChange({...exercise, sets:parseInt(e.target.value)||0})}
          required
        />
        <input 
          type="number" 
          placeholder="Reps" 
          value={exercise.reps || ''} 
          onChange={e=>onChange({...exercise, reps:parseInt(e.target.value)||0})}
          required
        />
        <input 
          type="number" 
          placeholder="Peso (kg)" 
          value={exercise.weight || ''} 
          onChange={e=>onChange({...exercise, weight:parseFloat(e.target.value)||0})}
        />
      </div>
    </div>
  )
}

export default function Dashboard(){
  const {token} = useAuth()
  const [workouts,setWorkouts] = useState([])
  const [loading,setLoading] = useState(false)
  const [showForm,setShowForm] = useState(false)
  const [viewingWorkout,setViewingWorkout] = useState(null)
  
  // Form fields
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [type,setType] = useState('strength')
  const [duration,setDuration] = useState(60)
  const [date,setDate] = useState(new Date().toISOString().split('T')[0])
  const [exercises,setExercises] = useState([{name:'',sets:0,reps:0,weight:0}])
  const [notes,setNotes] = useState('')
  const [editing, setEditing] = useState(null)

  async function loadWorkouts(){
    setLoading(true)
    try{
      const data = await api.get('/workouts')
      console.log('📋 Treinos carregados:', data)
      // A API pode retornar: [array] ou { workouts: [array] } ou { data: [array] }
      const workoutsArray = Array.isArray(data) ? data : (data?.workouts || data?.data || [])
      setWorkouts(workoutsArray)
    }catch(err){
      console.error(err)
      setWorkouts([])
    }finally{setLoading(false)}
  }

  useEffect(()=>{ loadWorkouts() },[token])

  function resetForm(){
    setName('')
    setDescription('')
    setType('strength')
    setDuration(60)
    setDate(new Date().toISOString().split('T')[0])
    setExercises([{name:'',sets:0,reps:0,weight:0}])
    setNotes('')
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(workout){
    setName(workout.name)
    setDescription(workout.description)
    setType(workout.type)
    setDuration(workout.duration)
    setDate(workout.date)
    setExercises(workout.exercises || [{name:'',sets:0,reps:0,weight:0}])
    setNotes(workout.notes || '')
    setEditing(workout)
    setShowForm(true)
  }

  async function handleSave(e){
    e.preventDefault()
    const workoutData = {
      name,
      description,
      type,
      duration: parseInt(duration),
      date,
      exercises: exercises.filter(ex => ex.name.trim() !== ''),
      notes
    }
    
    console.log('💾 Salvando treino:', workoutData)
    
    try{
      if(editing){
        await api.put(`/workouts/${editing.id}`,workoutData)
        toast.success('Treino atualizado!')
      }else{
        await api.post('/workouts',workoutData)
        toast.success('Treino criado!')
      }
      resetForm()
      loadWorkouts()
    }catch(err){
      console.error(err)
    }
  }

  async function handleDelete(workout){
    if(!confirm(`Confirma deletar o treino "${workout.name}"?`)) return
    try{
      await api.del(`/workouts/${workout.id}`)
      toast.success('Treino deletado!')
      loadWorkouts()
    }catch(err){console.error(err)}
  }

  function addExercise(){
    setExercises([...exercises, {name:'',sets:0,reps:0,weight:0}])
  }

  function updateExercise(index, updated){
    const newEx = [...exercises]
    newEx[index] = updated
    setExercises(newEx)
  }

  function removeExercise(index){
    setExercises(exercises.filter((_,i) => i !== index))
  }

  return (
    <div className="container">
      <div className="card">
        <Navbar />
        <h3>💪 Gerenciador de Treinos</h3>
        
        {!showForm && !viewingWorkout && (
          <>
            <button onClick={()=>setShowForm(true)} style={{marginBottom:16,background:'#10b981'}}>
              ➕ Novo Treino
            </button>

            <div style={{marginTop:16}}>
              {loading ? <div>Carregando...</div> : (
                workouts.length === 0 ? 
                  <div className="muted">Nenhum treino encontrado. Crie seu primeiro treino!</div> : 
                  workouts.map(w=> <WorkoutCard key={w.id} workout={w} onEdit={handleEdit} onDelete={handleDelete} onView={setViewingWorkout} />)
              )}
            </div>
          </>
        )}

        {viewingWorkout && (
          <div>
            <button onClick={()=>setViewingWorkout(null)} className="btn-small" style={{marginBottom:16}}>← Voltar</button>
            <h4>{viewingWorkout.name}</h4>
            <p className="muted">{viewingWorkout.description}</p>
            <div style={{display:'flex',gap:16,marginBottom:16,fontSize:14}}>
              <span>🏋️ {viewingWorkout.type}</span>
              <span>⏱️ {viewingWorkout.duration} min</span>
              <span>📅 {new Date(viewingWorkout.date).toLocaleDateString('pt-BR')}</span>
            </div>
            
            <h5>Exercícios:</h5>
            {viewingWorkout.exercises?.map((ex,i) => (
              <div key={i} style={{padding:12,background:'#f9fafb',borderRadius:6,marginBottom:8}}>
                <div><strong>{ex.name}</strong></div>
                <div className="muted" style={{fontSize:13}}>
                  {ex.sets} séries × {ex.reps} reps {ex.weight > 0 && `• ${ex.weight}kg`}
                </div>
              </div>
            ))}
            
            {viewingWorkout.notes && (
              <div style={{marginTop:16,padding:12,background:'#fef3c7',borderRadius:6}}>
                <strong>📝 Notas:</strong>
                <p style={{marginTop:4}}>{viewingWorkout.notes}</p>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div>
            <button onClick={resetForm} className="btn-small" style={{marginBottom:16}}>← Voltar</button>
            <h4>{editing ? 'Editar Treino' : 'Novo Treino'}</h4>
            
            <form onSubmit={handleSave}>
              <input placeholder="Nome do treino" value={name} onChange={e=>setName(e.target.value)} required />
              <textarea placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} rows={2} />
              
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                <div>
                  <label style={{fontSize:13,display:'block',marginBottom:4}}>Tipo</label>
                  <select value={type} onChange={e=>setType(e.target.value)} style={{width:'100%',padding:10}}>
                    <option value="strength">Força</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibilidade</option>
                    <option value="mixed">Misto</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:13,display:'block',marginBottom:4}}>Duração (min)</label>
                  <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} required />
                </div>
                <div>
                  <label style={{fontSize:13,display:'block',marginBottom:4}}>Data</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
                </div>
              </div>

              <div style={{marginTop:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <strong>Exercícios</strong>
                  <button type="button" onClick={addExercise} className="btn-small" style={{background:'#3b82f6'}}>
                    ➕ Adicionar Exercício
                  </button>
                </div>
                {exercises.map((ex,i) => (
                  <ExerciseForm 
                    key={i} 
                    exercise={ex} 
                    index={i} 
                    onChange={(updated)=>updateExercise(i,updated)}
                    onRemove={()=>removeExercise(i)}
                  />
                ))}
              </div>

              <textarea placeholder="Notas (opcional)" value={notes} onChange={e=>setNotes(e.target.value)} rows={2} />

              <div className="row">
                <button type="submit">{editing? '💾 Salvar alterações':'➕ Criar treino'}</button>
                <button type="button" onClick={resetForm} style={{background:'#6b7280'}}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
