/** Time-of-day greeting with first name. Client-only hour is fine. */
export function firstName(fullName: string) {
  const part = fullName.trim().split(/\s+/)[0] || fullName
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
}

export function greetingFor(fullName: string, date = new Date()) {
  const name = firstName(fullName)
  const hour = date.getHours()

  if (hour >= 5 && hour < 8) {
    return { line: `Hey early riser, ${name}`, sub: "The mesh is quiet — a good time to ask something clear." }
  }
  if (hour >= 8 && hour < 12) {
    return { line: `Good morning, ${name}`, sub: "Pick up a thread, or start a new one." }
  }
  if (hour >= 12 && hour < 17) {
    return { line: `Welcome back, ${name}`, sub: "Here’s what’s waiting for you in the mesh." }
  }
  if (hour >= 17 && hour < 21) {
    return { line: `Good evening, ${name}`, sub: "Catch up on answers, or leave one for a peer." }
  }
  if (hour >= 21 || hour < 1) {
    return { line: `Come in, midnight owl ${name}`, sub: "Late focus hits different. Your threads are here." }
  }
  // 1–5
  return { line: `Still awake, ${name}?`, sub: "Quiet hours — perfect for a thoughtful answer." }
}
